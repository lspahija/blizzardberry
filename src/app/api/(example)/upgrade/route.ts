export async function POST(_: Request) {
  return new Response(
    JSON.stringify({
      account_id: 1,
      username: 'John Doe',
      email: 'john@example.com',
      previous_plan: 'hobby',
      new_plan: 'pro',
      upgrade_status: 'success',
      upgraded_at: '2025-04-23T10:00:00Z',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}
