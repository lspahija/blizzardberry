'use client';

import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, PlusCircle } from 'lucide-react';
import { Chatbot } from '@/app/api/lib/model/chatbot/chatbot';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loadingChatbots, setLoadingChatbots] = useState(true);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  // Fetch chatbots
  useEffect(() => {
    async function fetchChatbots() {
      try {
        const response = await fetch('/api/chatbots');
        if (!response.ok) {
          throw new Error('Failed to fetch chatbots');
        }
        const data = await response.json();
        setChatbots(data.chatbots || []);
      } catch (error) {
        console.error('Error fetching chatbots:', error);
      } finally {
        setLoadingChatbots(false);
      }
    }

    if (status === 'authenticated') {
      fetchChatbots();
    }
  }, [status]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF8]">
        <p className="text-gray-900 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col bg-[#FFFDF8] p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Welcome, {session.user?.name}!
          </h1>
          <div className="relative">
            <div className="absolute inset-0 bg-gray-900 rounded translate-x-1 translate-y-1"></div>
            <Button
              className="relative bg-[#FFC480] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
              onClick={() => signOut({ redirectTo: '/' })}
            >
              Sign Out
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <Button
            asChild
            className="bg-[#FE4A60] text-white border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
          >
            <Link href="/chatbots/new" className="flex items-center">
              <PlusCircle className="mr-2 h-5 w-5" />
              Create New Chatbot
            </Link>
          </Button>
        </div>

        {loadingChatbots ? (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
          </div>
        ) : chatbots.length === 0 ? (
          <p className="text-gray-600 text-lg">
            No chatbots found. Create one to get started!
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {chatbots.map((chatbot) => (
              <Card
                key={chatbot.id}
                className="border-[3px] border-gray-900 bg-[#FFFDF8]"
              >
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    <Link
                      href={`/chatbots/${chatbot.id}`}
                      className="hover:underline"
                    >
                      {chatbot.name}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-2">
                    Domain: {chatbot.websiteDomain}
                  </p>
                  <p className="text-gray-600 mb-4">
                    Created: {new Date(chatbot.createdAt).toLocaleDateString()}
                  </p>
                  <Button
                    asChild
                    className="bg-[#FFC480] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
                  >
                    <Link href={`/chatbots/${chatbot.id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
