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
} from 'lucide-react';
import { useChatbots } from '@/app/(frontend)/hooks/useChatbots';
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
    chatbots,
    loadingChatbots,
    deletingChatbotId,
    fetchChatbots,
    handleDeleteChatbot,
  } = useChatbots();
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
      fetchChatbots();
    }
  }, [status, fetchChatbots]);

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
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Welcome, {session.user?.name}!
          </h1>
          <div className="flex gap-2">
            <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
              <DialogTrigger asChild>
                <div className="relative">
                  <div className="absolute inset-0 bg-gray-900 rounded translate-x-1 translate-y-1"></div>
                  <Button
                    className="relative bg-[#FFC480] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
                    onClick={() =>
                      posthog.capture('feedback_form_opened', {
                        user_email: session?.user?.email,
                      })
                    }
                  >
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Feedback
                  </Button>
                </div>
              </DialogTrigger>
              <DialogContent className="bg-[#FFFDF8] border-[3px] border-gray-900">
                <DialogHeader>
                  <DialogTitle className="text-gray-900">
                    Send Us Your Feedback
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="feedbackEmail" className="text-gray-900">
                      Email
                    </Label>
                    <Input
                      id="feedbackEmail"
                      value={feedbackEmail}
                      onChange={(e) => setFeedbackEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="mt-1 w-full rounded border-[2px] border-gray-900 p-2 bg-[#FFFDF8] text-gray-900"
                    />
                  </div>
                  <div>
                    <Label htmlFor="feedbackType" className="text-gray-900">
                      Feedback Type
                    </Label>
                    <select
                      id="feedbackType"
                      value={feedbackType}
                      onChange={(e) => setFeedbackType(e.target.value)}
                      className="mt-1 w-full rounded border-[2px] border-gray-900 p-2 bg-[#FFFDF8] text-gray-900"
                    >
                      <option value="bug">Bug Report</option>
                      <option value="feature">Feature Request</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="feedbackMessage" className="text-gray-900">
                      Message
                    </Label>
                    <Textarea
                      id="feedbackMessage"
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      placeholder="Describe the bug or feature request..."
                      className="mt-1 w-full rounded border-[2px] border-gray-900 p-2 bg-[#FFFDF8] text-gray-900"
                      rows={5}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsFeedbackOpen(false)}
                      className="border-[2px] border-gray-900 text-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-[#FE4A60] text-white border-[2px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Submit'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            <div className="relative">
              <div className="absolute inset-0 bg-gray-900 rounded translate-x-1 translate-y-1"></div>
              <Button
                className="relative bg-[#FFC480] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-6 flex gap-4">
          <Button
            asChild
            className="bg-[#FE4A60] text-white border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
            onClick={() =>
              posthog.capture('create_chatbot_clicked', {
                user_email: session?.user?.email,
              })
            }
          >
            <Link href="/chatbots/new" className="flex items-center">
              <PlusCircle className="mr-2 h-5 w-5" />
              Create New Chatbot
            </Link>
          </Button>
          <Button
            asChild
            className="bg-[#FFC480] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
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
                className="border-[3px] border-gray-900 bg-[#FFFDF8] flex flex-col h-full"
              >
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    <Link
                      href={`/chatbots/${chatbot.id}`}
                      className="hover:underline"
                      onClick={() =>
                        posthog.capture('chatbot_view_clicked', {
                          chatbot_id: chatbot.id,
                          user_email: session?.user?.email,
                        })
                      }
                    >
                      {chatbot.name}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 justify-between">
                  <div>
                    <p className="text-gray-600 mb-2">
                      <strong>Domain:</strong> {chatbot.websiteDomain}
                    </p>
                    <p className="text-gray-600 mb-2">
                      <strong>Created:</strong>{' '}
                      {new Date(chatbot.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600 mb-2">
                      <strong>Model:</strong> {chatbot.model}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex gap-2">
                      <Button
                        asChild
                        className="bg-[#FFC480] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
                      >
                        <Link href={`/chatbots/${chatbot.id}`}>
                          View Details
                        </Link>
                      </Button>
                      <Button
                        asChild
                        className="bg-[#FFC480] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform group"
                      >
                        <Link
                          href={`/chatbots/${chatbot.id}/edit`}
                          className="flex items-center gap-2"
                        >
                          <Settings className="h-4 w-4 transition-transform group-hover:rotate-45" />
                          <span>Edit</span>
                        </Link>
                      </Button>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() =>
                        chatbot.id && handleDeleteChatbot(chatbot.id)
                      }
                      disabled={deletingChatbotId === chatbot.id}
                      className="border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform h-9 px-4 mt-0.5"
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
