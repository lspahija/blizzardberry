import sql from '@/app/api/lib/store/db';
import { handlers } from '../event/handlerRegistry';

const BATCH_SIZE = 10; // tune: smaller keeps API latency down

export async function processPending(batch = BATCH_SIZE): Promise<number> {
  return sql.begin(async (sql) => {
    const events = await sql<DomainEvent[]>`
      UPDATE domain_events
      SET    status = 'PROCESSING', updated_at = now()
      WHERE  id IN (
        SELECT id
        FROM   domain_events
        WHERE  status = 'PENDING'
        ORDER  BY created_at
        LIMIT  ${batch}
        FOR UPDATE SKIP LOCKED
      )
      RETURNING *`;

    for (const ev of events) {
      try {
        const h = handlers[ev.type];
        if (h) await h(ev);
        await sql`UPDATE domain_events
                  SET status='PROCESSED', updated_at=now()
                  WHERE id=${ev.id}`;
      } catch (err: any) {
        await sql`UPDATE domain_events
                  SET status='FAILED', retry_count=retry_count+1,
                      last_error=${err.message}, updated_at=now()
                  WHERE id=${ev.id}`;
      }
    }
    return events.length;
  });
}

const PROCESSING_TIMEOUT = '1 minute';

export async function retryStuckEvents() {
  await sql`
    UPDATE domain_events
    SET    status = 'PENDING',
           updated_at = now()
    WHERE (
      status = 'PROCESSING'
        AND  updated_at < now() - interval ${PROCESSING_TIMEOUT}
      ) OR (
      status = 'FAILED'
        AND  retry_count < 5
        AND  updated_at < now() - interval ${PROCESSING_TIMEOUT}
      );
  `;
}
