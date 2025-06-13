export async function POST(req: Request) {
  const { type, emailAddress, message } = await req.json();

  try {
    const response = await fetch(
      `https://hooks.slack.com/services/${process.env.SLACK_WEBHOOK_PATH_SECRET}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: `Type: ${type}\nEmail: ${emailAddress}\nMessage: ${message}`,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Slack webhook request failed: ${response.status}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error sending to Slack:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to send to Slack' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
