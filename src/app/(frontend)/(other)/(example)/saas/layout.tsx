import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../../../globals.css';
import Script from 'next/script';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Example SaaS - Agent Demo',
  description: 'A demo SaaS showcasing our agent widget',
};

// Apply custom styles for this layout
const customStyles = `
  :root {
    --primary: oklch(0.65 0.15 150); /* Green primary color */
    --primary-foreground: oklch(0.95 0 0);
    --background: oklch(0.98 0.02 160); /* Light green-gray background */
    --foreground: oklch(0.2 0 0);
    --card: oklch(1 0 0);
    --card-foreground: oklch(0.2 0 0);
    --border: oklch(0.85 0.05 150);
    --radius: 0.75rem; /* Slightly larger radius */
  }

  .dark {
    --primary: oklch(0.7 0.18 150);
    --primary-foreground: oklch(0.95 0 0);
    --background: oklch(0.2 0.05 150);
    --foreground: oklch(0.95 0 0);
    --card: oklch(0.25 0.05 150);
    --card-foreground: oklch(0.95 0 0);
    --border: oklch(0.3 0.05 150);
  }
`;

export default function ExampleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Block layout in production
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <>
      <style>{customStyles}</style>
      <div className={`${inter.variable} antialiased`}>
        {children}
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self' *; script-src 'self' 'unsafe-inline' 'unsafe-eval' *; style-src 'self' 'unsafe-inline' *; font-src 'self' data: *; img-src 'self' data: *; manifest-src 'self' *;"
        />
        <div id="agent" />
        <Script id="BlizzardBerry-config" strategy="afterInteractive">
          {`
            window.agentUserConfig = {
              user_id: "example_user_123",
              user_hash: "example_hash_456",
              account_number: "1234567890",
              user_metadata: {
                name: "John Doe",
                email: "john@example.com",
                company: "Example Corp"
              }
            };
          `}
        </Script>
        <Script
          id="blizzardberry-agent"
          src="/agent/agent.js"
          strategy="afterInteractive"
          data-agent-id="7edd420f-4dbb-4efb-b382-d1f9165d54a5"
        />
        <Script id="BlizzardBerry-actions" strategy="afterInteractive">
          {`
            window.agentActions = {
              get_weather: async (params, userConfig) => {
                try {
                  const geoResponse = await fetch(
                    \`https://geocoding-api.open-meteo.com/v1/search?name=\${encodeURIComponent(params.location)}&count=1\`
                  );
                  const geoData = await geoResponse.json();
                  
                  if (!geoData.results?.[0]) {
                    return { status: 'error', error: \`Location "\${params.location}" not found\` };
                  }

                  const { latitude, longitude, name, country } = geoData.results[0];
                  
                  const weatherResponse = await fetch(
                    \`https://api.open-meteo.com/v1/forecast?latitude=\${latitude}&longitude=\${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code\`
                  );
                  const weatherData = await weatherResponse.json();
                  
                  if (!weatherData.current) {
                    return { status: 'error', error: 'Could not fetch weather data' };
                  }

                  return {
                    status: 'success',
                    data: {
                      location: \`\${name}, \${country}\`,
                      temperature: \`\${weatherData.current.temperature_2m}°C\`,
                      humidity: \`\${weatherData.current.relative_humidity_2m}%\`,
                      windSpeed: \`\${weatherData.current.wind_speed_10m} km/h\`,
                    }
                  };
                } catch (error) {
                  return { status: 'error', error: error.message || 'Failed to fetch weather data' };
                }
              }
            };
          `}
        </Script>
      </div>
    </>
  );
}
