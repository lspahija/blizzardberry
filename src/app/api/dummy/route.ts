export async function GET(_: Request) {
    return new Response(JSON.stringify({
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        status: "active",
        created_at: "2025-04-23T10:00:00Z"
    }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    });
}