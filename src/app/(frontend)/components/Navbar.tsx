'use client';

import { useAuth } from '@/app/context/AuthContext';
import { DashboardNavbar } from './DashboardNavbar';
import { LandingNavbar } from './LandingNavbar';
import { useState, useEffect } from 'react';

export function Navbar() {
  const { isLoggedIn, status } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading skeleton during initial render and while authentication is being determined
  if (!isClient || status === 'loading') {
    return (
      <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur border-b border-border shadow-md flex justify-between items-center p-4 pb-2">
        <div className="flex items-center">
          <div className="w-60 h-8 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="hidden md:flex items-center space-x-6">
          <div className="w-12 h-4 bg-muted animate-pulse rounded"></div>
          <div className="w-16 h-4 bg-muted animate-pulse rounded"></div>
          <div className="w-20 h-4 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="hidden md:flex space-x-3">
          <div className="w-20 h-9 bg-muted animate-pulse rounded"></div>
          <div className="w-24 h-9 bg-muted animate-pulse rounded"></div>
        </div>
      </nav>
    );
  }

  return isLoggedIn ? <DashboardNavbar /> : <LandingNavbar />;
}
