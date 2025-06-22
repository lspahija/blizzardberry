'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from './context/AuthContext';
import { TeamProvider } from './(frontend)/contexts/TeamContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <TeamProvider>
          {children}
        </TeamProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
