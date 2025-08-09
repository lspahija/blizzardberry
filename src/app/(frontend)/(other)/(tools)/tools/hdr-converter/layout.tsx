import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HDR Image Converter - Transform Your Photos with HDR Enhancement',
  description: 'Convert your regular photos to stunning HDR images with enhanced brightness, gamma correction, and vibrant colors. Free online HDR converter with real-time preview.',
  keywords: 'HDR converter, HDR image, photo enhancement, image processing, high dynamic range, brightness, gamma correction, photo editor, image tool',
  authors: [{ name: 'BlizzardBerry' }],
  creator: 'BlizzardBerry',
  publisher: 'BlizzardBerry',
  
  // Open Graph / Facebook
  openGraph: {
    title: 'HDR Image Converter - Transform Your Photos with HDR Enhancement',
    description: 'Convert your regular photos to stunning HDR images with enhanced brightness, gamma correction, and vibrant colors. Free online HDR converter with real-time preview.',
    url: 'https://blizzardberry.ai/tools/hdr-converter',
    siteName: 'BlizzardBerry',
    images: [
      {
        url: 'https://blizzardberry.ai/image/logo.png',
        width: 1200,
        height: 630,
        alt: 'HDR Image Converter - Before and after comparison of HDR enhancement',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  
  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'HDR Image Converter - Transform Your Photos with HDR Enhancement',
    description: 'Convert your regular photos to stunning HDR images with enhanced brightness, gamma correction, and vibrant colors. Free online HDR converter.',
    images: ['https://blizzardberry.ai/image/logo.png'],
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
  
  // Structured data
  other: {
    'og:image:width': '1200',
    'og:image:height': '630',
  },
};

export default function HDRConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}