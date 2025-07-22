import type { Metadata } from 'next';
import { FrameworkProvider } from '@/app/(frontend)/contexts/useFramework';
import { Suspense } from 'react';
import { BlizzardBerryAgent } from '@/app/(frontend)/components/BlizzardBerryAgent';
import { BlizzardBerryPublicAgent } from '@/app/(frontend)/components/BlizzardBerryPublicAgent';
import { Navbar } from '@/app/(frontend)/components/Navbar';

export const metadata: Metadata = {
  title: 'BlizzardBerry',
  description: 'The Future of UX is Here',
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
      </FrameworkProvider>
    </Suspense>
  );
}
