'use client';

import { Navbar } from '@/app/(frontend)/components/Navbar';
import { useAuth } from '@/app/context/AuthContext';
import { useEffect } from 'react';

export default function PricingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isLoggedIn } = useAuth();
  useEffect(() => {
    console.log('Pricing Layout - Auth State:', isLoggedIn);
  }, [isLoggedIn]);

  return (
    <>
      {isLoggedIn && <Navbar />}
      {children}
    </>
  );
}
