'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { clientLogger } from '../../api/lib/logger/clientLogger'

export function LoggingProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()

  useEffect(() => {
    // Set user ID when session is available
    if (status === 'authenticated' && session?.user?.id) {
      clientLogger.setUserId(session.user.id)
    }
  }, [session, status])

  return <>{children}</>
}