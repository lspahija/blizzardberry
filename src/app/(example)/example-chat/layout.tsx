import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../../globals.css";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Chat Demo",
    description: "A demo chat application",
};

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

export default function ChatLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <head>
            <style>{customStyles}</style>
        </head>
        <body className={`${inter.variable} antialiased`}>
        {children}
        </body>
        </html>
    );
}