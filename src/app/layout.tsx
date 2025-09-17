import { Geist, Geist_Mono } from 'next/font/google';
import '@/app/(frontend)/globals.css';
import { Providers } from './providers';
import { ScrollToTop } from '@/app/(frontend)/components/ScrollToTop';
import { ErrorBoundary } from '@/app/(frontend)/components/ErrorBoundary';
import { LoggingProvider } from '@/app/(frontend)/components/LoggingProvider';
import '@/app/api/lib/middleware/globalErrorHandler'; // Initialize global error handlers
import '@/app/api/lib/middleware/nextjsErrorInterceptor'; // Enhanced error interception
import type { Metadata } from 'next';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'BlizzardBerry - AI Agent Platform',
  description:
    'Transform any app into an AI-powered experience. Add natural language interfaces for customer support, help desks, and user interactions. Let users control your software simply by typing. Super easy integration, powerful results.',
  keywords:
    'natural language interface, AI agent, chatbot, customer support, help desk, app integration, AI models, pluggable AI, software automation, customer service automation, AI agent platform',
  authors: [{ name: 'BlizzardBerry' }],
  creator: 'BlizzardBerry',
  publisher: 'BlizzardBerry',

  // Open Graph / Facebook
  openGraph: {
    title: 'BlizzardBerry - AI Agent Platform',
    description:
      'Transform any app into an AI-powered experience. Add natural language interfaces for customer support, help desks, and user interactions. Let users control your software simply by typing. Super easy integration, powerful results.',
    url: 'https://blizzardberry.com',
    siteName: 'BlizzardBerry',
    images: [
      {
        url: 'https://blizzardberry.com/image/social-preview.png',
        width: 1200,
        height: 630,
        alt: 'BlizzardBerry - Give Your Users an AI Agent',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'BlizzardBerry - AI Agent Platform',
    description:
      'Transform any app into an AI-powered experience. Add natural language interfaces for customer support, help desks, and user interactions. Let users control your software simply by typing. Super easy integration, powerful results.',
    images: ['https://blizzardberry.com/image/social-preview.png'],
    creator: '@BlizzardBerry',
  },

  // Additional SEO
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <ErrorBoundary>
            <LoggingProvider>
              <ScrollToTop />
              {children}
            </LoggingProvider>
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
