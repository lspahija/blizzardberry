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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col bg-background p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Welcome, {session.user?.name}!
          </h1>
        </div>
        <div className="mb-6 flex flex-col sm:flex-row gap-2">
          <Button
            asChild
            className="bg-brand text-primary-foreground border-[3px] border-border transition-all duration-200 text-base font-semibold px-6 py-2 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:-translate-x-0.5 hover:bg-brand/90 w-full sm:w-auto"
            onClick={() =>
              posthog.capture('create_agent_clicked', {
                user_email: session?.user?.email,
              })
            }
          >
            <Link
              href="/agents/new"
              className="flex items-center justify-center"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Create New Agent
            </Link>
          </Button>
          <Button
            asChild
            className="bg-secondary text-secondary-foreground border-[3px] border-border transition-all duration-200 text-base font-semibold px-6 py-2 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:-translate-x-0.5 hover:bg-secondary/90 w-full sm:w-auto"
            onClick={() =>
              posthog.capture('user_config_clicked', {
                user_email: session?.user?.email,
              })
            }
          >
            <Link
              href="/user-config"
              className="flex items-center justify-center"
            >
              User Configuration
            </Link>
          </Button>
        </div>

        {loadingAgents ? (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-foreground" />
          </div>
        ) : agents.length === 0 ? (
          <p className="text-muted-foreground text-lg mb-4 flex items-center justify-center">
            <Bot className="h-6 w-6 mr-2 text-brand" />
            No agents found. Create one to get started!
          </p>
        ) : (
          <Card className="border-[3px] border-border bg-card mb-6 rounded-xl shadow-xl border-l-8 border-l-brand">
            <CardHeader className="flex items-center space-x-2">
              <Bot className="h-6 w-6 text-brand" />
              <CardTitle className="text-2xl font-bold text-foreground">
                Your Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {agents.map((agent, idx) => (
                  <li
                    key={agent.id}
                    className="border-t pt-4 sm:pt-2 flex flex-col sm:flex-row sm:items-center transition hover:bg-muted hover:shadow-md rounded-lg group px-4 py-2"
                  >
                    <div className="flex flex-1 min-w-0 items-start">
                      <div className="flex-1 min-w-0">
                        <p className="text-lg md:text-lg text-foreground font-semibold mb-1 truncate">
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
                        <p className="text-sm text-muted-foreground mb-1 truncate">
                          <span className="font-semibold">Domain:</span>{' '}
                          {agent.websiteDomain}
                        </p>
                        <p className="text-sm text-muted-foreground mb-1">
                          <span className="font-semibold">Created:</span>{' '}
                          {new Date(agent.createdAt).toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground mb-1 truncate">
                          <span className="font-semibold">Model:</span>{' '}
                          {agent.model}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0 sm:ml-4">
                      <Button
                        asChild
                        className="bg-secondary text-secondary-foreground border-[2px] border-border hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform rounded-lg px-4 py-2 hover:bg-secondary/90 flex-1 sm:flex-none"
                      >
                        <Link
                          href={`/agents/${agent.id}`}
                          className="flex-1 sm:flex-none"
                        >
                          View
                        </Link>
                      </Button>
                      <Button
                        asChild
                        className="bg-secondary text-secondary-foreground border-[2px] border-border hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform rounded-lg px-4 py-2 flex items-center gap-2 hover:bg-secondary/90 flex-1 sm:flex-none"
                      >
                        <Link
                          href={`/agents/${agent.id}/edit`}
                          className="flex items-center gap-2 justify-center"
                        >
                          <Settings className="h-4 w-4 transition-transform group-hover:rotate-45" />
                          <span>Edit</span>
                        </Link>
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => agent.id && handleDeleteAgent(agent.id)}
                        disabled={deletingAgentId === agent.id}
                        className="border-[2px] border-border hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform rounded-full p-2"
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
                      <hr className="my-2 border-border" />
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
