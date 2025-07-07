'use client';

import { useAuth } from '@/app/context/AuthContext';
import { DashboardNavbar } from './DashboardNavbar';
import { LandingNavbar } from './LandingNavbar';

export function Navbar() {
  const { isLoggedIn } = useAuth();
  
  return isLoggedIn ? <DashboardNavbar /> : <LandingNavbar />;
} 