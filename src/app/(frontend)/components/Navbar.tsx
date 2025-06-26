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
  Menu,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/(frontend)/components/ui/select';

export function Navbar() {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState('bug');
  const { data: session } = useSession();
  const [feedbackEmail, setFeedbackEmail] = useState(
    session?.user?.email || ''
  );
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isMobileMenuOpen]);

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

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/usage', label: 'Usage' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <>
      <nav className="bg-card border-b-[3px] border-border px-4 sm:px-6 py-3 flex items-center justify-between rounded-b-2xl shadow-md mb-8 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight select-none hover:underline focus:underline outline-none flex items-center"
          >
            Blizzard<span className="text-[#FE4A60]">Berry</span>
          </Link>
          <span className="hidden sm:block mx-2 text-gray-300 select-none">
            |
          </span>
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm sm:text-base font-semibold px-3 py-1.5 rounded-lg border-[2px] border-transparent hover:border-muted hover:bg-muted transition-colors text-gray-900"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/docs"
            className="hidden sm:flex text-sm sm:text-base font-semibold px-3 py-1.5 rounded-lg border-[2px] border-transparent hover:border-muted hover:bg-muted transition-colors text-[#FE4A60]"
          >
            Docs
          </Link>
          <button
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm sm:text-base font-semibold text-gray-900 border-[2px] border-transparent hover:border-muted hover:bg-muted rounded-lg transition"
            onClick={() => setIsFeedbackOpen(true)}
          >
            <MessageSquare className="h-4 w-4" />
            Feedback
          </button>
          <button
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm sm:text-base font-semibold text-gray-900 border-[2px] border-transparent hover:border-muted hover:bg-muted rounded-lg transition"
            onClick={() => signOut({ redirectTo: '/' })}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-6 w-6 text-gray-900" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/20"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-[280px] bg-[#FFFDF8] border-l-[3px] border-gray-900 p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="h-6 w-6 text-gray-900" />
              </button>
            </div>
            <div className="space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-base font-semibold px-3 py-2 rounded-lg border-[2px] border-transparent hover:border-muted hover:bg-muted transition-colors text-gray-900"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/docs"
                className="block text-base font-semibold px-3 py-2 rounded-lg border-[2px] border-transparent hover:border-muted hover:bg-muted transition-colors text-[#FE4A60]"
              >
                Docs
              </Link>
              <button
                className="w-full text-left text-base font-semibold px-3 py-2 rounded-lg border-[2px] border-transparent hover:border-muted hover:bg-muted transition-colors text-gray-900"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsFeedbackOpen(true);
                }}
              >
                Feedback
              </button>
              <button
                className="w-full text-left text-base font-semibold px-3 py-2 rounded-lg border-[2px] border-transparent hover:border-muted hover:bg-muted transition-colors text-gray-900"
                onClick={() => signOut({ redirectTo: '/' })}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
        <DialogContent
          className="bg-card border-[3px] border-border border-l-8"
          style={{ borderLeftColor: 'var(--color-destructive)' }}
        >
          <DialogHeader className="flex items-center gap-2 mb-2">
            <Send className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
            <DialogTitle className="text-foreground text-xl sm:text-2xl font-bold tracking-tight">
              Send Us Your Feedback
            </DialogTitle>
          </DialogHeader>
          <div className="bg-muted border-l-4 border-destructive rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 flex items-center gap-3">
            <Info className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
            <span className="text-muted-foreground text-xs sm:text-sm">
              We value your feedback! Please let us know about bugs, feature
              requests, or anything else that can help us improve.
            </span>
          </div>
          <form
            onSubmit={handleFeedbackSubmit}
            className="space-y-4 sm:space-y-6"
          >
            <div>
              <Label
                htmlFor="feedbackEmail"
                className="text-foreground text-sm sm:text-base font-semibold flex items-center gap-2"
              >
                <Mail className="h-4 w-4 text-destructive" />
                Email
              </Label>
              <Input
                id="feedbackEmail"
                value={feedbackEmail}
                onChange={(e) => setFeedbackEmail(e.target.value)}
                placeholder="Enter your email"
                className="mt-2 w-full rounded-lg border-[2px] border-border p-2 sm:p-3 bg-card text-foreground focus:ring-2 focus:ring-destructive focus:border-destructive transition text-sm sm:text-base"
              />
            </div>
            <div>
              <Label
                htmlFor="feedbackType"
                className="text-foreground text-sm sm:text-base font-semibold flex items-center gap-2"
              >
                <Tag className="h-4 w-4 text-destructive" />
                Feedback Type
              </Label>
              <Select value={feedbackType} onValueChange={setFeedbackType}>
                <SelectTrigger className="mt-2 w-full rounded-lg border-[2px] border-border p-2 sm:p-3 bg-card text-foreground focus:ring-2 focus:ring-destructive focus:border-destructive transition text-sm sm:text-base">
                  <SelectValue placeholder="Select feedback type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label
                htmlFor="feedbackMessage"
                className="text-foreground text-sm sm:text-base font-semibold flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4 text-destructive" />
                Message
              </Label>
              <Textarea
                id="feedbackMessage"
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                placeholder="Describe the bug or feature request..."
                className="mt-2 w-full rounded-lg border-[2px] border-border p-2 sm:p-3 bg-card text-foreground focus:ring-2 focus:ring-destructive focus:border-destructive transition min-h-[100px] sm:min-h-[120px] text-sm sm:text-base"
                rows={5}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4 sm:mt-6">
              <button
                type="button"
                className="border-[2px] border-border text-white bg-destructive hover:bg-destructive/80 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs sm:text-sm"
                onClick={() => setIsFeedbackOpen(false)}
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-secondary text-secondary-foreground border-[2px] border-border hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs sm:text-sm hover:bg-secondary/90"
              >
                {isSubmitting ? (
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                ) : (
                  <Send className="h-3 w-3 sm:h-4 sm:w-4" />
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
