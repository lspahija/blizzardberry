'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/(frontend)/components/ui/card';
import { Input } from '@/app/(frontend)/components/ui/input';
import { Textarea } from '@/app/(frontend)/components/ui/textarea';
import { Button } from '@/app/(frontend)/components/ui/button';
import { Label } from '@/app/(frontend)/components/ui/label';
import { Mail, MessageSquare, Send } from 'lucide-react';

export default function ContactPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [formStatus, setFormStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('Submitting...');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'Contact Message',
          emailAddress: email,
          message,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send message');
      }
      setFormStatus('Message sent successfully!');
      setEmail('');
      setMessage('');
      setTimeout(() => setFormStatus(''), 2000);
    } catch (err) {
      setFormStatus('Error: ' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-16 px-4">
      <h1 className="text-3xl md:text-5xl font-bold mb-20 text-center text-foreground">Contact Us</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <Card className="flex-1 min-w-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Mail className="h-6 w-6 text-brand" />
              Send a Message
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email">
                  <Mail className="h-4 w-4 text-brand" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="message">
                  <MessageSquare className="h-4 w-4 text-brand" />
                  Message
                </Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                  rows={6}
                  placeholder="How can we help you?"
                  className="mt-2 min-h-[120px]"
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-secondary text-secondary-foreground border-[2px] border-border hover:bg-secondary/90 rounded-xl transition-transform duration-150 hover:scale-105"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
              {formStatus && (
                <p className="text-center text-sm font-medium text-muted-foreground mt-2">{formStatus}</p>
              )}
            </form>
          </CardContent>
        </Card>
        <Card className="flex-1 min-w-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <MessageSquare className="h-6 w-6 text-brand" />
              Book a Meeting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center w-full">
              <Button
                asChild
                size="lg"
                className="bg-brand text-primary-foreground hover:bg-brand/90 rounded-xl px-8 py-4 text-lg font-semibold shadow-md border-none transition-transform duration-150 hover:scale-105"
              >
                <a
                  href="https://calendly.com/blizzardberry/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Book a Meeting
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
