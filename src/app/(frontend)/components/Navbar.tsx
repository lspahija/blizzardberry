'use client';

import {
  MessageSquare,
  LogOut,
  Send,
  Info,
  Mail,
  Tag,
  X,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/(frontend)/components/ui/dialog';
import { Input } from '@/app/(frontend)/components/ui/input';
import { Textarea } from '@/app/(frontend)/components/ui/textarea';
import { Label } from '@/app/(frontend)/components/ui/label';
import { toast } from 'sonner';

export function Navbar() {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState('bug');
  const { data: session } = useSession();
  const [feedbackEmail, setFeedbackEmail] = useState(
    session?.user?.email || ''
  );
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        headers: { 'Content-Type': 'application/json' },
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
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <nav className="bg-[#FFFDF8] border-b-[3px] border-gray-900 px-6 py-3 flex items-center gap-6 rounded-b-2xl shadow-md mb-8 sticky top-0 z-40">
        <Link
          href="/"
          className="text-2xl font-bold text-gray-900 tracking-tight select-none hover:underline focus:underline outline-none flex items-center"
        >
          Blizzard<span className="text-[#FE4A60]">Berry</span>
        </Link>
        <span className="mx-2 text-gray-300 select-none">|</span>
        <Link
          href="/dashboard"
          className="text-base font-semibold px-3 py-1.5 rounded-lg border-[2px] border-transparent hover:border-[#FE4A60] hover:bg-[#FFF4DA] transition-colors text-gray-900"
        >
          Dashboard
        </Link>
        <Link
          href="/usage"
          className="text-base font-semibold px-3 py-1.5 rounded-lg border-[2px] border-transparent hover:border-[#FE4A60] hover:bg-[#FFF4DA] transition-colors text-gray-900"
        >
          Usage
        </Link>
        <Link
          href="/pricing"
          className="text-base font-semibold px-3 py-1.5 rounded-lg border-[2px] border-transparent hover:border-[#FE4A60] hover:bg-[#FFF4DA] transition-colors text-gray-900"
        >
          Pricing
        </Link>
        <Link
          href="/settings"
          className="text-base font-semibold px-3 py-1.5 rounded-lg border-[2px] border-transparent hover:border-[#FE4A60] hover:bg-[#FFF4DA] transition-colors text-gray-900"
        >
          Settings
        </Link>
        <div className="flex items-center gap-2 ml-auto">
          <a
            href="https://blizzardberry.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-semibold px-3 py-1.5 rounded-lg border-[2px] border-transparent hover:border-[#FE4A60] hover:bg-[#FFF4DA] transition-colors text-[#FE4A60]"
          >
            Docs
          </a>
          <button
            className="flex items-center gap-2 px-3 py-1.5 text-base font-semibold text-gray-900 border-[2px] border-transparent hover:border-[#FE4A60] hover:bg-[#FFF4DA] rounded-lg transition"
            onClick={() => setIsFeedbackOpen(true)}
          >
            <MessageSquare className="h-4 w-4" />
            Feedback
          </button>
          <button
            className="flex items-center gap-2 px-3 py-1.5 text-base font-semibold text-gray-900 border-[2px] border-transparent hover:border-[#FE4A60] hover:bg-[#FFF4DA] rounded-lg transition"
            onClick={() => signOut({ redirectTo: '/' })}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </nav>
      <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
        <DialogContent className="bg-[#FFFDF8] border-[3px] border-gray-900 border-l-8 border-l-[#FE4A60] rounded-2xl shadow-2xl p-8">
          <DialogHeader className="flex items-center gap-2 mb-2">
            <Send className="h-6 w-6 text-[#FE4A60]" />
            <DialogTitle className="text-gray-900 text-2xl font-bold tracking-tight">
              Send Us Your Feedback
            </DialogTitle>
          </DialogHeader>
          <div className="bg-[#FFF4DA] border-l-4 border-[#FFC480] rounded-lg p-4 mb-6 flex items-center gap-3">
            <Info className="h-5 w-5 text-[#FFC480]" />
            <span className="text-gray-700 text-sm">
              We value your feedback! Please let us know about bugs, feature
              requests, or anything else that can help us improve.
            </span>
          </div>
          <form onSubmit={handleFeedbackSubmit} className="space-y-6">
            <div>
              <Label
                htmlFor="feedbackEmail"
                className="text-gray-900 text-base font-semibold flex items-center gap-2"
              >
                <Mail className="h-4 w-4 text-[#FE4A60]" />
                Email
              </Label>
              <Input
                id="feedbackEmail"
                value={feedbackEmail}
                onChange={(e) => setFeedbackEmail(e.target.value)}
                placeholder="Enter your email"
                className="mt-2 w-full rounded-lg border-[2px] border-gray-900 p-3 bg-[#FFFDF8] text-gray-900 focus:ring-2 focus:ring-[#FE4A60] focus:border-[#FE4A60] transition"
              />
            </div>
            <div>
              <Label
                htmlFor="feedbackType"
                className="text-gray-900 text-base font-semibold flex items-center gap-2"
              >
                <Tag className="h-4 w-4 text-[#FE4A60]" />
                Feedback Type
              </Label>
              <select
                id="feedbackType"
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
                className="mt-2 w-full rounded-lg border-[2px] border-gray-900 p-3 bg-[#FFFDF8] text-gray-900 focus:ring-2 focus:ring-[#FE4A60] focus:border-[#FE4A60] transition appearance-none"
              >
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <Label
                htmlFor="feedbackMessage"
                className="text-gray-900 text-base font-semibold flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4 text-[#FE4A60]" />
                Message
              </Label>
              <Textarea
                id="feedbackMessage"
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                placeholder="Describe the bug or feature request..."
                className="mt-2 w-full rounded-lg border-[2px] border-gray-900 p-3 bg-[#FFFDF8] text-gray-900 focus:ring-2 focus:ring-[#FE4A60] focus:border-[#FE4A60] transition min-h-[120px]"
                rows={5}
              />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                className="border-[2px] border-gray-900 text-white bg-[#FE4A60] hover:bg-[#ff6a7a] transition font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm"
                onClick={() => setIsFeedbackOpen(false)}
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#FFC480] text-gray-900 border-[2px] border-gray-900 hover:bg-[#FFD9A0] transition font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Submit
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
