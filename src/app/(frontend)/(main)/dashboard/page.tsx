'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTeams } from '@/app/(frontend)/hooks/useTeams';
import { Loader2 } from 'lucide-react';

export default function DashboardRedirectPage() {
  const { status, data: session } = useSession();
  const { teams, loading: loadingTeams, fetchTeams } = useTeams();
  const router = useRouter();
  const [sessionTimeout, setSessionTimeout] = useState(false);

  console.log('Dashboard page - status:', status);
  console.log('Dashboard page - full session:', session);
  console.log('Dashboard page - session.user:', session?.user);
  console.log('Dashboard page - teams:', teams, 'loading:', loadingTeams);

  // Add a timeout for session loading
  useEffect(() => {
    if (status === 'loading') {
      const timer = setTimeout(() => {
        console.log('Session loading timeout reached');
        setSessionTimeout(true);
      }, 5000); // 5 second timeout

      return () => clearTimeout(timer);
    } else {
      setSessionTimeout(false);
    }
  }, [status]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      console.log('User authenticated, fetching teams...');
      fetchTeams();
    }
  }, [status, session?.user?.id, fetchTeams]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      if (!loadingTeams && teams !== undefined) {
        console.log('Teams loaded, checking redirection...');
        if (teams.length > 0) {
          console.log('Redirecting to first team:', teams[0].id);
          router.replace(`/dashboard/${teams[0].id}/agents`);
        } else {
          console.log('No teams found, redirecting to new-team');
          router.replace('/dashboard/new-team');
        }
      }
    }
  }, [status, session?.user?.id, teams, loadingTeams, router]);

  // Show loading while session is loading
  if (status === 'loading' && !sessionTimeout) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-lg">Loading session...</p>
        </div>
      </div>
    );
  }

  // Show error if session loading times out
  if (sessionTimeout) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg text-foreground mb-4">Session loading timed out</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Show loading while fetching teams
  if (status === 'authenticated' && loadingTeams) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (status === 'unauthenticated') {
    router.replace('/login');
    return null;
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background">
      <div className="flex items-center gap-2 text-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-lg">Loading your dashboard...</p>
      </div>
    </div>
  );
} 