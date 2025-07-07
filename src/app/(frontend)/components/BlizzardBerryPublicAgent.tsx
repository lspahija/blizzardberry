'use client';

import { useSession } from 'next-auth/react';
import Script from 'next/script';

export function BlizzardBerryPublicAgent() {
  const { data: session, status } = useSession();

  // Only render scripts if user is NOT authenticated (for public landing page)
  if (status === 'authenticated' || status === 'loading') {
    return null;
  }

  return (
    <>
      <Script 
        id="blizzardberry-public-agent"
        src="http://localhost:3000/agent/agent.js" 
        strategy="afterInteractive"
        data-agent-id="f452cd58-23aa-4a6c-87d0-e68fb7384c73"
      />
      <Script id="BlizzardBerry-public-actions" strategy="afterInteractive">
        {`
          window.agentActions = {
            openDocs: async (params) => {
              window.location.href = '/docs';
              return { success: true, message: 'Opening documentation page...' };
            },

            openPricing: async (params) => {
              window.location.href = '/pricing';
              return { success: true, message: 'Opening pricing page...' };
            },

            openContact: async (params) => {
              window.location.href = '/contact';
              return { success: true, message: 'Opening contact page...' };
            },

            openLogin: async (params) => {
              window.location.href = '/login';
              return { success: true, message: 'Opening login page...' };
            },

            openDashboard: async (params) => {
              window.location.href = '/dashboard';
              return { success: true, message: 'Opening dashboard...' };
            }
          };
        `}
      </Script>
    </>
  );
} 