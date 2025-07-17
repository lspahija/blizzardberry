import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import { FrameworkProvider } from '@/app/(frontend)/contexts/useFramework';
import { Suspense } from 'react';
import { AuthProvider } from '@/app/context/AuthContext';
import { BlizzardBerryAgent } from '@/app/(frontend)/components/BlizzardBerryAgent';
import { BlizzardBerryPublicAgent } from '@/app/(frontend)/components/BlizzardBerryPublicAgent';

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
      <SessionProvider>
        <AuthProvider>
          <FrameworkProvider>
            {children}
            <BlizzardBerryAgent />
            <BlizzardBerryPublicAgent />
          </FrameworkProvider>
        </AuthProvider>
      </SessionProvider>
    </Suspense>
  );
}
