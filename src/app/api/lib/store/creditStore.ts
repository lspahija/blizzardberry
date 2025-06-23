import sql from '@/app/api/lib/store/db';
import { handle } from '@/app/api/lib/store/eventProcessor';

export async function addCredit(
  userId: string,
  qty: number,
  idempotencyKey: string,
  expiresAt?: Date
) {
  const eventType = 'CREDIT_ADDED';
  let eventId: number;
  const idempotencyKeyWithType = `${idempotencyKey}_${eventType}`;
  const roundedQty = Math.ceil(qty);

  await sql.begin(async (sql) => {
    const [event] = await sql`
      INSERT INTO domain_events (user_id, idempotency_key, type, event_data)
      VALUES (${userId}, ${idempotencyKeyWithType}, ${eventType},
              ${sql.json({ qty: roundedQty, expiresAt: expiresAt || null, source: 'purchase' })})
      RETURNING id`;
    eventId = event.id;

    await sql`
      INSERT INTO credit_batches (user_id, quantity_remaining, expires_at)
      VALUES (${userId}, ${roundedQty}, ${expiresAt || null})`;
  });

  await handle({
    id: eventId,
    type: eventType,
    user_id: userId,
    event_data: {
      qty: roundedQty,
      expiresAt: expiresAt || null,
      source: 'purchase',
    },
  });
}

export async function holdCredit(
  userId: string,
  maxProbe: number,
  ref: string,
  idempotencyKey: string
) {
  const holdIds: number[] = [];
  let eventId: number;
  const roundedMaxProbe = Math.ceil(maxProbe);

  await sql.begin(async (sql) => {
    const batches = await sql`
      SELECT id, quantity_remaining
      FROM credit_batches
      WHERE user_id = ${userId}
        AND quantity_remaining > 0
        AND (expires_at IS NULL OR expires_at > now())
      ORDER BY expires_at NULLS LAST, created_at
        FOR UPDATE SKIP LOCKED`;

    let need = roundedMaxProbe;
    for (const b of batches) {
      if (need === 0) break;
      const take = Math.min(need, b.quantity_remaining);
      
      await sql`
        UPDATE credit_batches
        SET quantity_remaining = quantity_remaining - ${Math.ceil(take)}
        WHERE id = ${b.id}`;

      const [{ id: holdId }] = await sql`
        INSERT INTO credit_holds (user_id, batch_id, quantity_held)
        VALUES (${userId}, ${b.id}, ${Math.ceil(take)})
        RETURNING id`;
      holdIds.push(Number(holdId));

      need -= take;
    }
    if (need > 0) throw new Error('You do not have enough credits to complete this request. Please purchase more credits: See https://blizzardberry.com/pricing');

    const eventType = 'CREDIT_HOLD_CREATED';
    const idempotencyKeyWithType = `${idempotencyKey}_${eventType}`;
    const [event] = await sql`
      INSERT INTO domain_events (user_id, idempotency_key, type, event_data)
      VALUES (${userId}, ${idempotencyKeyWithType}, ${eventType},
              ${sql.json({ holdIds, maxProbe: roundedMaxProbe, ref })})
      RETURNING id`;
    eventId = event.id;
  });

  await handle({
    id: eventId,
    type: 'CREDIT_HOLD_CREATED',
    user_id: userId,
    event_data: { holdIds, maxProbe: roundedMaxProbe, ref },
  });

  return holdIds;
}

export async function captureCredit(
  userId: string,
  holdIds: number[],
  actualUsed: number,
  ref: string,
  idempotencyKey: string
) {
  let eventId: number;
  const roundedActualUsed = Math.ceil(actualUsed);

  await sql.begin(async (sql) => {
    const holds = await sql`
      SELECT id, batch_id, quantity_held
      FROM credit_holds
      WHERE id = ANY(${holdIds}) AND state = 'ACTIVE'
        FOR UPDATE`;

    let need = roundedActualUsed;
    for (const h of holds) {
      if (need === 0) break;
      const take = Math.min(need, h.quantity_held);

      const remainder = h.quantity_held - take;
      if (remainder > 0) {
        await sql`
          UPDATE credit_batches
          SET quantity_remaining = quantity_remaining + ${Math.floor(remainder)}
          WHERE id = ${h.batch_id}`;
      }

      await sql`
        UPDATE credit_holds
        SET state = 'CAPTURED',
            quantity_held = ${Math.ceil(take)}
        WHERE id = ${h.id}`;

      need -= take;
    }
    if (need > 0) throw new Error('Used > authorised');

    const eventType = 'CREDIT_HOLD_CAPTURED';
    const idempotencyKeyWithType = `${idempotencyKey}_${eventType}`;

    const [event] = await sql`
      INSERT INTO domain_events (user_id, idempotency_key, type, event_data)
      VALUES (${userId}, ${idempotencyKeyWithType}, ${eventType},
              ${sql.json({ holdIds, actualUsed: roundedActualUsed, ref })})
      RETURNING id`;
    eventId = event.id;
  });

  await handle({
    id: eventId,
    type: 'CREDIT_HOLD_CAPTURED',
    user_id: userId,
    event_data: { holdIds, actualUsed: roundedActualUsed, ref },
  });
}

export async function releaseExpiredHolds() {
  const events: {
    id: number;
    user_id: string;
    event_data: { holdId: number; quantity: number };
  }[] = [];

  await sql.begin(async (sql) => {
    const expired = await sql`
      SELECT h.id, h.user_id, h.batch_id, h.quantity_held
      FROM credit_holds h
      WHERE h.state = 'ACTIVE'
        AND h.expires_at < now()
        FOR UPDATE`;

    for (const e of expired) {
      await sql`
        UPDATE credit_batches
        SET quantity_remaining = quantity_remaining + ${Math.floor(e.quantity_held)}
        WHERE id = ${e.batch_id}`;

      await sql`
        UPDATE credit_holds
        SET state = 'EXPIRED'
        WHERE id = ${e.id}`;

      const eventType = 'CREDIT_HOLD_EXPIRED';
      const idempotencyKey = `${e.id}_${eventType}`;

      const [event] = await sql`
        INSERT INTO domain_events (user_id, idempotency_key, type, event_data)
        VALUES (${e.user_id}, ${idempotencyKey}, ${eventType},
                ${sql.json({ holdId: e.id, quantity: Math.floor(e.quantity_held) })})
        RETURNING id`;

      events.push({
        id: event.id,
        user_id: e.user_id,
        event_data: { holdId: e.id, quantity: Math.floor(e.quantity_held) },
      });
    }
  });

  for (const event of events) {
    await handle({
      id: event.id,
      type: 'CREDIT_HOLD_EXPIRED',
      user_id: event.user_id,
      event_data: event.event_data,
    });
  }
}

export async function removeCredit(
  userId: string,
  batchId: number,
  qty: number,
  reason: string,
  idempotencyKey: string
) {
  let eventId: number;
  const roundedQty = Math.ceil(qty);

  await sql.begin(async (sql) => {
    await sql`
      UPDATE credit_batches
      SET quantity_remaining = quantity_remaining - ${roundedQty}
      WHERE id = ${batchId} AND user_id = ${userId}`;

    const eventType = 'CREDIT_REMOVED';
    const idempotencyKeyWithType = `${idempotencyKey}_${eventType}`;

    const [event] = await sql`
      INSERT INTO domain_events (user_id, idempotency_key, type, event_data)
      VALUES (${userId}, ${idempotencyKeyWithType}, ${eventType},
              ${sql.json({ batchId, qty: roundedQty, reason })})
      RETURNING id`;
    eventId = event.id;
  });

  await handle({
    id: eventId,
    type: 'CREDIT_REMOVED',
    user_id: userId,
    event_data: { batchId, qty: roundedQty, reason },
  });
}

export async function expireBatches() {
  const events: {
    id: number;
    user_id: string;
    event_data: { batchId: number; qty: number };
  }[] = [];

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

      const eventType = 'CREDIT_EXPIRED';
      const idempotencyKey = `${d.id}_${eventType}`;

      const [event] = await sql`
        INSERT INTO domain_events (user_id, idempotency_key, type, event_data)
        VALUES (${d.user_id}, ${idempotencyKey}, ${eventType},
                ${sql.json({ batchId: d.id, qty: Math.floor(d.quantity_remaining) })})
        RETURNING id`;

      events.push({
        id: event.id,
        user_id: d.user_id,
        event_data: { batchId: d.id, qty: Math.floor(d.quantity_remaining) },
      });
    }
  });

  for (const event of events) {
    await handle({
      id: event.id,
      type: 'CREDIT_EXPIRED',
      user_id: event.user_id,
      event_data: event.event_data,
    });
  }
}
