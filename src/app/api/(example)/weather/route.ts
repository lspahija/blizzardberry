export async function GET(req: Request) {
  return new Response(
    JSON.stringify({
      location: 'San Francisco, CA',
      temperature: 72,
      condition: 'partly cloudy',
      humidity: 65,
      wind_speed: 8,
      wind_direction: 'NW',
      forecast: [
        { day: 'Today', high: 75, low: 58, condition: 'partly cloudy' },
        { day: 'Tomorrow', high: 78, low: 61, condition: 'sunny' },
        { day: 'Friday', high: 71, low: 55, condition: 'cloudy' }
      ]
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}
