import sql from '@/app/api/lib/store/db';

export async function addCredit(
  userId: string,
  qty: number,
  idempotencyKey: string,
  expiresAt?: Date
) {
  await sql.begin(async (sql) => {
    await sql`
      INSERT INTO domain_events (user_id, idempotency_key, type, event_data)
      VALUES (${userId}, ${idempotencyKey}, 'CREDIT_ADDED',
             ${sql.json({ qty, expiresAt, source: 'purchase' })})`;

    await sql`
      INSERT INTO credit_batches (user_id, quantity_remaining, expires_at)
      VALUES (${userId}, ${qty}, ${expiresAt || null})`;
  });
}

export async function holdCredit(
  userId: string,
  maxProbe: number, // upper bound you are willing to reserve
  ref: string, // “chat-completion #abc”
  idempotencyKey: string
) {
  const holdIds: number[] = [];

  await sql.begin(async (sql) => {
    // pick soon-to-expire batches first, SKIP LOCKED removes race
    const batches = await sql`
      SELECT id, quantity_remaining
      FROM credit_batches
      WHERE user_id = ${userId}
        AND quantity_remaining > 0
        AND (expires_at IS NULL OR expires_at > now())
      ORDER BY expires_at NULLS LAST, created_at
      FOR UPDATE SKIP LOCKED`;

    let need = maxProbe;
    for (const b of batches) {
      if (need === 0) break;
      const take = Math.min(need, b.quantity_remaining);

      await sql`
        UPDATE credit_batches
        SET quantity_remaining = quantity_remaining - ${take}
        WHERE id = ${b.id}`;

      const [{ id: holdId }] = await sql`
        INSERT INTO credit_holds (user_id, batch_id, quantity_held)
        VALUES (${userId}, ${b.id}, ${take})
        RETURNING id`;
      holdIds.push(holdId);

      need -= take;
    }
    if (need > 0) throw new Error('Insufficient balance');

    /* -------- event log -------- */
    await sql`
      INSERT INTO domain_events (user_id, idempotency_key, type, event_data)
      VALUES (${userId}, ${idempotencyKey} 'credit_hold_created',
             ${sql.json({ holdIds, maxProbe, ref })})`;
  });

  return holdIds;
}

export async function captureCredit(
  holdIds: number[],
  actualUsed: number, // final token count
  ref: string,
  idempotencyKey: string
) {
  await sql.begin(async (sql) => {
    const holds = await sql`
      SELECT id, batch_id, quantity_held
      FROM credit_holds
      WHERE id = ANY(${sql.array(holdIds)}) AND state = 'active'
      FOR UPDATE`;

    let need = actualUsed;
    for (const h of holds) {
      if (need === 0) break;
      const take = Math.min(need, h.quantity_held);

      /* nothing to do on credit_batches: tokens were already removed
         when the hold was created                              */

      const remainder = h.quantity_held - take;
      if (remainder > 0) {
        await sql`
          UPDATE credit_batches
          SET quantity_remaining = quantity_remaining + ${remainder}
          WHERE id = ${h.batch_id}`;
      }

      await sql`
        UPDATE credit_holds
        SET state = 'captured',
            quantity_held = ${take}
        WHERE id = ${h.id}`;

      need -= take;
    }
    if (need > 0) throw new Error('Used > authorised');

    /* -------- event log -------- */
    await sql`
      INSERT INTO domain_events (user_id, idempotency_key, type, event_data)
      VALUES (
        (SELECT user_id FROM credit_holds WHERE id = ${holdIds[0]}), ${idempotencyKey}
        'CREDIT_HOLD_CAPTURED',
        ${sql.json({ holdIds, actualUsed, ref })}
      )`;
  });
}

// run every few minutes
async function releaseExpiredHolds() {
  await sql.begin(async (sql) => {
    const expired = await sql`
      SELECT h.id, h.user_id, h.batch_id, h.quantity_held
      FROM credit_holds h
      WHERE h.state = 'active'
        AND h.expires_at < now()
      FOR UPDATE`;

    for (const e of expired) {
      await sql`
        UPDATE credit_batches
        SET quantity_remaining = quantity_remaining + ${e.quantity_held}
        WHERE id = ${e.batch_id}`;

      await sql`
        UPDATE credit_holds
        SET state = 'expired'
        WHERE id = ${e.id}`;

      const idempotencyKey = `CREDIT_HOLD_EXPIRED_${e.id}`;

      await sql`
        INSERT INTO domain_events (user_id, idempotency_key, type, event_data)
        VALUES (${e.user_id}, ${idempotencyKey}, 'CREDIT_HOLD_EXPIRED',
               ${sql.json({ holdId: e.id, quantity: e.quantity_held })})`;
    }
  });
}

async function removeCredit(
  userId: string,
  batchId: number,
  qty: number,
  reason: string,
  idempotencyKey: string
) {
  await sql.begin(async (sql) => {
    await sql`
      UPDATE credit_batches
      SET quantity_remaining = quantity_remaining - ${qty}
      WHERE id = ${batchId} AND user_id = ${userId}`;

    await sql`
      INSERT INTO domain_events (user_id, idempotency_key, type, event_data)
      VALUES (${userId}, ${idempotencyKey}, 'CREDIT_REMOVED',
             ${sql.json({ batchId, qty, reason })})`;
  });
}

// run nightly
async function expireBatches() {
  await sql.begin(async (sql) => {
    const dying = await sql`
      SELECT id, user_id, quantity_remaining
      FROM credit_batches
      WHERE quantity_remaining > 0
        AND expires_at < now()
      FOR UPDATE`;

    for (const d of dying) {
      await sql`
        UPDATE credit_batches
        SET quantity_remaining = 0
        WHERE id = ${d.id}`;

      const idempotencyKey = `CREDIT_EXPIRED_${d.id}`;

      await sql`
        INSERT INTO domain_events (user_id, idempotency_key, type, event_data)
        VALUES (${d.user_id}, ${idempotencyKey}, 'CREDIT_EXPIRED',
               ${sql.json({ batchId: d.id, qty: d.quantity_remaining })})`;
    }
  });
}
