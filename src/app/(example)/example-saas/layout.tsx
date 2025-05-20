import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "../../globals.css";
import Script from "next/script"; // Import from root

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Example SaaS - Chatbot Demo",
    description: "A demo SaaS showcasing our chatbot widget",
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
    if (process.env.NODE_ENV === "production") {
        return null;
    }

    return (
        <html lang="en">
        <head>
            <style>{customStyles}</style>
        </head>
        <body className={`${inter.variable} antialiased`}>
        {children}
        <meta httpEquiv="Content-Security-Policy"
              content="default-src 'self' *; script-src 'self' 'unsafe-inline' 'unsafe-eval' *; style-src 'self' 'unsafe-inline' *; manifest-src 'self' *;"/>
        <div id="myWidget"/>
        <Script id="widget-script" strategy="afterInteractive">
            {
                `(function() {
    var s = document.createElement('script');
    s.src = 'http://localhost:3000/widget.js';
    s.async = true;
    document.head.appendChild(s);
  })();`
            }
        </Script>
        <Script id="client-actions" strategy="afterInteractive">
            {`
window.omni_interface.registerActions({
  get_weather: async (args, user) => {
    try {
      const response = await fetch(
        \`https://api.weatherapi.com/v1/current.json?q=\${args.location}\`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch weather data.");
      }

      const data = await response.json();

      return { data, status: "success" };
    } catch (error) {
      // Return only the error message without any data
      return { status: "error", error: error.message };
    }
  }
});
            `}
        </Script>
        </body>
        </html>
    );
}