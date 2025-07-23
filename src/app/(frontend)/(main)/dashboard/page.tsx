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
import { Loader2, PlusCircle, Trash2, Bot } from 'lucide-react';
import { useAgents } from '@/app/(frontend)/hooks/useAgents';
import posthog from 'posthog-js';
import { toast } from 'sonner';
import { DeleteConfirmationDialog } from '@/app/(frontend)/components/ui/delete-confirmation-dialog';

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<string | null>(null);

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

  const handleOpenDeleteDialog = (agentId: string) => {
    setAgentToDelete(agentId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (agentToDelete) {
      await handleDeleteAgent(agentToDelete);
      setIsDeleteDialogOpen(false);
      setAgentToDelete(null);
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
    <div>
      <motion.div
        className="min-h-screen flex flex-col bg-background p-4 sm:p-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-4xl mx-auto w-full">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
              Welcome, {session.user?.name}!
            </h1>
          </div>
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              asChild
              className="bg-brand text-primary-foreground border-[3px] border-border transition-all duration-200 text-sm sm:text-base font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:-translate-x-0.5 hover:bg-brand/90 w-full sm:w-auto"
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
                <PlusCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Create New Agent
              </Link>
            </Button>
            <Button
              asChild
              className="bg-secondary text-secondary-foreground border-[3px] border-border transition-all duration-200 text-sm sm:text-base font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:-translate-x-0.5 hover:bg-secondary/90 w-full sm:w-auto"
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
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-foreground" />
            </div>
          ) : agents.length === 0 ? (
            <p className="text-base sm:text-lg text-muted-foreground mb-4 flex items-center justify-center text-center">
              <Bot className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-brand" />
              No agents found. Create one to get started!
            </p>
          ) : (
            <Card className="border-[3px] border-border bg-card mb-6 rounded-xl shadow-xl border-l-8 border-l-brand">
              <CardHeader className="flex items-center space-x-2 pb-4">
                <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-brand" />
                <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">
                  Your Agents
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-3 sm:space-y-4">
                  {agents.map((agent, idx) => (
                    <li
                      key={agent.id}
                      className="border-t pt-3 sm:pt-4 flex flex-col sm:flex-row sm:items-center transition hover:bg-muted hover:shadow-md rounded-lg group px-3 sm:px-4 py-3 sm:py-2 relative"
                    >
                      <Link
                        href={`/agents/${agent.id}`}
                        className="flex flex-1 min-w-0 items-start cursor-pointer"
                        onClick={() =>
                          posthog.capture('agent_view_clicked', {
                            agent_id: agent.id,
                            user_email: session?.user?.email,
                          })
                        }
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-base sm:text-lg text-foreground font-semibold mb-1 sm:mb-2 truncate hover:underline">
                            {agent.name}
                          </p>
                          <div className="space-y-1 sm:space-y-2">
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                              <span className="font-semibold">Domain:</span>{' '}
                              {agent.websiteDomain}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              <span className="font-semibold">Created:</span>{' '}
                              {new Date(agent.createdAt).toLocaleString()}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                              <span className="font-semibold">Model:</span>{' '}
                              {agent.model}
                            </p>
                          </div>
                        </div>
                      </Link>
                      <div className="flex gap-2 w-full sm:w-auto mt-3 sm:mt-0 sm:ml-4">
                        <Button
                          variant="destructive"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleOpenDeleteDialog(agent.id);
                          }}
                          className="border-[2px] border-border hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform rounded-full p-2 flex-shrink-0"
                          title="Delete Agent"
                        >
                          <Trash2 className="h-4 w-4 transition-transform duration-200 group-hover:scale-125 group-hover:-rotate-12" />
                        </Button>
                      </div>
                      {idx < agents.length - 1 && (
                        <hr className="my-2 sm:my-3 border-border" />
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
          title="Delete Agent"
          message="Are you sure you want to delete this agent? This action cannot be undone."
          isLoading={!!deletingAgentId}
        />
      </motion.div>
    </div>
  );
}
