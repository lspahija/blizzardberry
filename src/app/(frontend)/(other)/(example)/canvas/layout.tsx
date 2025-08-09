import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../../../globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Canvas Demo',
  description: 'A demo canvas showcasing our agent widget',
};

export default function ExampleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className={`${inter.variable} antialiased`}>{children}</div>
    </>
  );
}
