export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    const receiptId = Math.random().toString(36).substring(2, 15);
    const timestamp = new Date().toISOString();
    const tax = amount * 0.0875; // 8.75% tax
    const total = amount + tax;

    const receipt = {
      id: receiptId,
      timestamp,
      items: [
        {
          description: 'Service',
          amount: amount,
        },
      ],
      subtotal: amount,
      tax: Number(tax.toFixed(2)),
      total: Number(total.toFixed(2)),
      payment_method: 'Card',
      merchant: 'BlizzardBerry',
    };

    return new Response(JSON.stringify(receipt), {
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
