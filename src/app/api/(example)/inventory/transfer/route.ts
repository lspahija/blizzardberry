export async function POST(req: Request) {
  try {
    const { sku, from, to, qty } = await req.json();

    if (!sku || !from || !to || qty === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: sku, from, to, qty' }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    const transferId = Math.random().toString(36).substring(2, 15);
    const timestamp = new Date().toISOString();

    const transfer = {
      id: transferId,
      timestamp,
      sku,
      from,
      to,
      qty,
      status: 'pending',
      requestedBy: 'system',
    };

    return new Response(JSON.stringify(transfer), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }
}