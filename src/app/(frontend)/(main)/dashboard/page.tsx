'use client';

import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/app/(frontend)/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/app/(frontend)/components/ui/card';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { Chatbot } from '@/app/api/lib/model/chatbot/chatbot';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loadingChatbots, setLoadingChatbots] = useState(true);
  const [deletingChatbotId, setDeletingChatbotId] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  const handleDeleteChatbot = async (chatbotId: string) => {
    if (!confirm('Are you sure you want to delete this chatbot? This action cannot be undone.')) {
      return;
    }

    setDeletingChatbotId(chatbotId);
    try {
      const response = await fetch(`/api/chatbots/${chatbotId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete chatbot');
      }

      setChatbots(chatbots.filter(chatbot => chatbot.id !== chatbotId));
    } catch (error) {
      console.error('Error deleting chatbot:', error);
      alert('Failed to delete chatbot. Please try again.');
    } finally {
      setDeletingChatbotId(null);
    }
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
                    <strong>Domain:</strong> {chatbot.websiteDomain}
                  </p>
                  <p className="text-gray-600 mb-4">
                    <strong>Created:</strong> {new Date(chatbot.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      asChild
                      className="bg-[#FFC480] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
                    >
                      <Link href={`/chatbots/${chatbot.id}`}>View Details</Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => chatbot.id && handleDeleteChatbot(chatbot.id)}
                      disabled={deletingChatbotId === chatbot.id}
                      className="border-[3px] border-gray-900"
                    >
                      {deletingChatbotId === chatbot.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
