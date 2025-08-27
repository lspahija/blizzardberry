'use client';

import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/app/(frontend)/components/ui/card';
import { Input } from '@/app/(frontend)/components/ui/input';
import { Textarea } from '@/app/(frontend)/components/ui/textarea';
import { RetroButton } from '@/app/(frontend)/components/ui/retro-button';
import { Label } from '@/app/(frontend)/components/ui/label';
import { Mail, Send, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import posthog from 'posthog-js';

export default function ContactPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [formStatus, setFormStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('Submitting...');
    setIsSubmitting(true);

    posthog.capture('contact_form_submitted', {
      email,
      message_length: message.length,
    });

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

      posthog.capture('contact_form_success', {
        email,
      });

      setFormStatus('Message sent successfully!');
      setEmail('');
      setMessage('');
      setTimeout(() => setFormStatus(''), 2000);
    } catch (err) {
      posthog.capture('contact_form_failed', {
        email,
        error: (err as Error).message,
      });
      setFormStatus('Error: ' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Header Section with Gradient Background */}
      <motion.div
        className="bg-gradient-to-br from-brand/10 to-brand/5 border-b border-border"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="container mx-auto max-w-6xl py-12 px-4">
          <motion.div className="text-center" variants={itemVariants}>
            <h1 className="text-4xl md:text-6xl font-bold mb-5 text-foreground tracking-tight">
              Get in Touch
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-normal">
              Have questions about our AI agents? We&apos;d love to hear from
              you! You can send us a message or book a meeting.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Content Section */}
      <motion.div
        className="container mx-auto max-w-6xl py-8 px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <motion.div className="lg:col-span-2" variants={itemVariants}>
            <Card className="border-[3px] border-border rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:-translate-x-1 group">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-foreground">
                  <div className="p-2 bg-brand/10 rounded-lg">
                    <Mail className="h-6 w-6 text-brand" />
                  </div>
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label
                      htmlFor="email"
                      className="text-base font-semibold text-foreground"
                    >
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="your@email.com"
                      className="mt-2 border-[2px] border-border rounded-lg focus:border-brand transition-colors"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="message"
                      className="text-base font-semibold text-foreground"
                    >
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={6}
                      placeholder="How can we help you?"
                      className="mt-2 border-[2px] border-border rounded-lg focus:border-brand transition-colors min-h-[140px] resize-none"
                    />
                  </div>
                  <RetroButton
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-brand text-primary-foreground hover:bg-brand/90 font-semibold text-base py-3"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </RetroButton>
                  {formStatus && (
                    <motion.p
                      className="text-center text-sm font-medium text-muted-foreground mt-4 p-3 rounded-lg bg-muted/50"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {formStatus}
                    </motion.p>
                  )}
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Options */}
          <motion.div className="space-y-6" variants={itemVariants}>
            {/* Book Meeting Card */}
            <Card className="border-[3px] border-border rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:-translate-x-1 group">
              <CardHeader className="pb-1">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-foreground">
                  <div className="p-2 bg-brand/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-brand" />
                  </div>
                  Book a Meeting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Schedule a 30-minute call to discuss your AI agent
                  requirements and see how we can help.
                </p>
                <RetroButton
                  asChild
                  className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-medium px-6 h-10"
                  shadowColor="foreground"
                >
                  <a
                    href="https://calendly.com/blizzardberry/30min"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => posthog.capture('meeting_booking_clicked')}
                  >
                    Schedule Call
                  </a>
                </RetroButton>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Contact Info Section */}
      <motion.div
        className="bg-muted/30 py-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="container mx-auto max-w-6xl px-4">
          <motion.div className="text-center" variants={itemVariants}>
            <p className="text-muted-foreground">
              Or email us directly at:{' '}
              <a
                href="mailto:support@blizzardberry.com"
                className="text-brand hover:underline font-medium"
              >
                support@blizzardberry.com
              </a>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
