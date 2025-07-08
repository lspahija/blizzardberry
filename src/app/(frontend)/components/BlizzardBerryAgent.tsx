'use client';

import { useSession } from 'next-auth/react';
import Script from 'next/script';

export function BlizzardBerryAgent() {
  const { data: session, status } = useSession();

  // Only render scripts if user is authenticated
  if (status !== 'authenticated' || !session?.user) {
    return null;
  }

  return (
    <>
      <Script id="BlizzardBerry-config" strategy="afterInteractive">
        {`
          window.agentUserConfig = {
            user_id: "${session.user.id}",
            user_metadata: {
              name: "${session.user.name}",
              email: "${session.user.email}",
            }
          };
        `}
      </Script>
      <Script 
        id="blizzardberry-agent"
        src="http://localhost:3000/agent/agent.js" 
        strategy="afterInteractive"
        data-agent-id="102d8bea-18a5-4543-b802-d150d2f21e6d"
      />
      <Script id="BlizzardBerry-actions" strategy="afterInteractive">
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