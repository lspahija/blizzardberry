import type { Metadata } from 'next';
import { FrameworkProvider } from '@/app/(frontend)/contexts/useFramework';
import { Suspense } from 'react';
import { BlizzardBerryAgent } from '@/app/(frontend)/components/BlizzardBerryAgent';
import { BlizzardBerryPublicAgent } from '@/app/(frontend)/components/BlizzardBerryPublicAgent';
import { Navbar } from '@/app/(frontend)/components/Navbar';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'BlizzardBerry',
  description: 'Give Your Users an AI Agent',
};

export default function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={null}>
      <FrameworkProvider>
        <Navbar />
        {children}
        <BlizzardBerryAgent />
        <BlizzardBerryPublicAgent />
        <Script src="/lib/user-action-tracker.js" />
      </FrameworkProvider>
    </Suspense>
  );
}
