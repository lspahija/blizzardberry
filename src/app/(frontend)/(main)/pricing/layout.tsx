'use client';

import { Navbar } from '@/app/(frontend)/components/Navbar';
import { useAuth } from '@/app/context/AuthContext';

export default function PricingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isLoggedIn } = useAuth();

  return (
    <>
      {isLoggedIn && <Navbar />}
      {children}
    </>
  );
}
