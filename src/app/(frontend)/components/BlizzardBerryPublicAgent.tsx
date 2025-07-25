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
        id="blizzardberry-agent"
        src="http://localhost:3000/agent/agent.js"
        strategy="afterInteractive"
        data-agent-id="7b593b84-7f96-41ed-a167-c4c8be7e6972"
      />
      <Script id="blizzardberry-actions" strategy="afterInteractive">
        {`
        window.agentActions = {
    tell_cool: async (userConfig) => {
        try {
            console.log('you are cool');
            return {
                status: 'success',
            };
        } catch (error) {
            return {
                status: 'error',
                error: error.message || 'Failed to execute action'
            };
        }
    },
    tell_ok: async (userConfig) => {
    try {
      console.log('you are ok');
      return { 
        status: 'success'
      };
    } catch (error) {
      return { 
        status: 'error', 
        error: error.message || 'Failed to execute action' 
      };
    }
  }
};
      `}
      </Script>
    </>
  );
}
