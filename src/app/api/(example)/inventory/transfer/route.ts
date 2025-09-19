export async function POST(req: Request) {
  try {
    const { fromLocation, toLocation, items } = await req.json();

    if (!fromLocation || !toLocation || !items || !Array.isArray(items)) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: fromLocation, toLocation, items' }),
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
      fromLocation,
      toLocation,
      items: items.map((item: any) => ({
        itemId: item.itemId,
        quantity: item.quantity,
        name: item.name || `Item ${item.itemId}`,
      })),
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