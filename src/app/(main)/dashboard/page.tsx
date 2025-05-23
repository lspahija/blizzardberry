'use client';

import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { data: session, status } = useSession();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF8]">
        <p className="text-gray-900 text-lg">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF8]">
        <p className="text-gray-900 text-lg">
          You are not signed in.{' '}
          <Link href="/" className="text-[#FE4A60] hover:underline">
            Go to homepage
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center bg-[#FFFDF8] p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Welcome, {session.user?.name}!
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          You&apos;re signed in with {session.user?.email}.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gray-900 rounded translate-x-1 translate-y-1"></div>
            <Button
              className="relative bg-[#FFC480] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              Sign Out
            </Button>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gray-900 rounded translate-x-1 translate-y-1"></div>
            <Button
              asChild
              variant="outline"
              className="relative bg-[#FFFDF8] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
            >
              <Link href="/profile">View Profile</Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
