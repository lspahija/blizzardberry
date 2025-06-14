'use client';

import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/app/(frontend)/components/ui/button';
import { Input } from '@/app/(frontend)/components/ui/input';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/app/(frontend)/components/ui/card';
import {
  Loader2,
  PlusCircle,
  Trash2,
  Settings,
  MessageSquare,
  Bot,
  Send,
  Info,
  Mail,
  Tag,
  X,
} from 'lucide-react';
import { useAgents } from '@/app/(frontend)/hooks/useAgents';
import posthog from 'posthog-js';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/(frontend)/components/ui/dialog';
import { Textarea } from '@/app/(frontend)/components/ui/textarea';
import { Label } from '@/app/(frontend)/components/ui/label';
import { toast } from 'sonner';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const {
    agents,
    loadingAgents,
    deletingAgentId,
    fetchAgents,
    handleDeleteAgent,
  } = useAgents();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState('bug');
  const [feedbackEmail, setFeedbackEmail] = useState(
    session?.user?.email || ''
  );
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      posthog.identify(session.user.id || session.user.email, {
        email: session.user.email,
        name: session.user.name,
      });

      posthog.capture('dashboard_viewed', {
        user_email: session.user.email,
      });
    }
  }, [status, session]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAgents();
    }
  }, [status, fetchAgents]);

  const handleSignOut = async () => {
    posthog.capture('user_signed_out', {
      user_email: session?.user?.email,
    });
    await signOut({ redirectTo: '/' });
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) {
      toast.error('Please enter a message before submitting.');
      return;
    }
    if (!feedbackEmail.trim()) {
      toast.error('Please enter an email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: feedbackType,
          emailAddress: feedbackEmail,
          message: feedbackMessage,
        }),
      });

      if (response.ok) {
        toast.success('Thank you for your feedback!');
        setFeedbackEmail(session?.user?.email || '');
        setFeedbackMessage('');
        setIsFeedbackOpen(false);
        posthog.capture('feedback_submitted', {
          user_email: session?.user?.email,
          feedback_type: feedbackType,
        });
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Welcome, {session.user?.name}!
          </h1>
        </div>
        <div className="mb-6 flex space-x-4">
          <Button
            asChild
            className="bg-[#FE4A60] text-white border-[3px] border-gray-900 transition-all duration-200 text-base font-semibold px-6 py-2 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:-translate-x-0.5 hover:bg-[#ff6a7a]"
            onClick={() =>
              posthog.capture('create_agent_clicked', {
                user_email: session?.user?.email,
              })
            }
          >
            <Link href="/agents/new" className="flex items-center">
              <PlusCircle className="mr-2 h-5 w-5" />
              Create New Agent
            </Link>
          </Button>
          <Button
            asChild
            className="bg-[#FFC480] text-gray-900 border-[3px] border-gray-900 transition-all duration-200 text-base font-semibold px-6 py-2 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:-translate-x-0.5"
            onClick={() =>
              posthog.capture('user_config_clicked', {
                user_email: session?.user?.email,
              })
            }
          >
            <Link href="/user-config" className="flex items-center">
              User Configuration
            </Link>
          </Button>
        </div>

        {loadingAgents ? (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
          </div>
        ) : agents.length === 0 ? (
          <p className="text-gray-600 text-lg mb-4 flex items-center justify-center">
            <Bot className="h-6 w-6 mr-2 text-[#FE4A60]" />
            No agents found. Create one to get started!
          </p>
        ) : (
          <Card className="border-[3px] border-gray-900 bg-[#FFFDF8] mb-6 rounded-xl shadow-xl border-l-8 border-l-[#FE4A60]">
            <CardHeader className="flex items-center space-x-2">
              <Bot className="h-6 w-6 text-[#FE4A60]" />
              <CardTitle className="text-2xl font-bold text-gray-900">
                Your Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {agents.map((agent, idx) => (
                  <li
                    key={agent.id}
                    className="border-t pt-2 flex items-center transition hover:bg-[#FFF4DA] hover:shadow-md rounded-lg group px-4 py-2"
                  >
                    <Bot className="h-4 w-4 text-[#FE4A60]/80 mr-3 mt-1" />
                    <div className="flex-1">
                      <p className="text-lg md:text-lg text-base text-gray-900 font-semibold mb-1">
                        <Link
                          href={`/agents/${agent.id}`}
                          className="hover:underline focus:underline outline-none"
                          onClick={() =>
                            posthog.capture('agent_view_clicked', {
                              agent_id: agent.id,
                              user_email: session?.user?.email,
                            })
                          }
                        >
                          {agent.name}
                        </Link>
                      </p>
                      <p className="text-sm text-gray-500 mb-1">
                        <span className="font-semibold">Domain:</span>{' '}
                        {agent.websiteDomain}
                      </p>
                      <p className="text-sm text-gray-500 mb-1">
                        <span className="font-semibold">Created:</span>{' '}
                        {new Date(agent.createdAt).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500 mb-1">
                        <span className="font-semibold">Model:</span>{' '}
                        {agent.model}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        asChild
                        className="bg-[#FFC480] text-gray-900 border-[2px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform rounded-lg px-4 py-2"
                      >
                        <Link href={`/agents/${agent.id}`}>View</Link>
                      </Button>
                      <Button
                        asChild
                        className="bg-[#FFC480] text-gray-900 border-[2px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform rounded-lg px-4 py-2 flex items-center gap-2"
                      >
                        <Link
                          href={`/agents/${agent.id}/edit`}
                          className="flex items-center gap-2"
                        >
                          <Settings className="h-4 w-4 transition-transform group-hover:rotate-45" />
                          <span>Edit</span>
                        </Link>
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => agent.id && handleDeleteAgent(agent.id)}
                        disabled={deletingAgentId === agent.id}
                        className="border-[2px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform rounded-full p-2"
                        title="Delete Agent"
                      >
                        {deletingAgentId === agent.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 transition-transform duration-200 group-hover:scale-125 group-hover:-rotate-12" />
                        )}
                      </Button>
                    </div>
                    {idx < agents.length - 1 && (
                      <hr className="my-2 border-gray-200" />
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </motion.div>
  );
}
