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
  return (
    <>
      <style>{customStyles}</style>
      <div className={`${inter.variable} antialiased`}>
        {children}
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self' *; script-src 'self' 'unsafe-inline' 'unsafe-eval' *; style-src 'self' 'unsafe-inline' *; font-src 'self' data: *; img-src 'self' data: *; manifest-src 'self' *;"
        />
      </div>
      <Script
        id="blizzardberry-agent"
        src="http://localhost:3000/agent/agent.js"
        strategy="afterInteractive"
        data-agent-id="601ae097-4ebc-4f3c-89aa-f2118e595d62"
      />
      <Script id="blizzardberry-actions" strategy="afterInteractive">
        {`
  window.agentActions = {
    logSomething: async (agentUserConfig, params) => {
      // Your custom action logic here
      // Access parameters from params object: params.message
      console.log(params.message)
      return { status: 'success', results: [params.message] };
  }
  };
  `}
      </Script>
    </>
  );
}
