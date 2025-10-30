'use client';

import { useState } from 'react';
import { Button } from '@/app/(frontend)/components/ui/button';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, X } from 'lucide-react';

export default function ProxyDemo() {
  const [step, setStep] = useState<'url' | 'email' | 'loading' | 'iframe'>('url');
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [encodedUrl, setEncodedUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      setStep('email');
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setStep('loading');

    // Add https:// if no protocol is specified
    const normalizedUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BLIZZARDBERRY_MIRROR_BASE_URL}/api/encode`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: normalizedUrl }),
        }
      );

      const data = await response.json();
      setEncodedUrl(data.proxyUrl);
      setStep('iframe');
    } catch (error) {
      console.error('Failed to encode URL:', error);
      setIsSubmitting(false);
      setStep('url');
      alert('Something went wrong. Please try again.');
    }
  };

  const handleBack = () => {
    if (step === 'email') {
      setStep('url');
    }
  };

  const handleClose = () => {
    setStep('url');
    setUrl('');
    setEmail('');
    setEncodedUrl('');
    setIsSubmitting(false);
  };

  // Show fullscreen iframe when demo is loaded
  if (step === 'iframe' && encodedUrl) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="absolute top-4 right-4 z-50">
          <Button
            onClick={handleClose}
            variant="outline"
            size="lg"
            className="bg-background border-2 border-border shadow-lg"
          >
            <X className="mr-2 h-4 w-4" />
            Close Demo
          </Button>
        </div>
        <iframe
          src={encodedUrl}
          className="w-full h-full border-none"
          title="Website Demo"
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        className="bg-gradient-to-br from-brand/5 to-background border-[3px] border-border rounded-2xl p-8 shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand/10 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-brand" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Try It On Your Website
          </h3>
          <p className="text-base sm:text-lg text-muted-foreground">
            See how our AI agent looks on your site in seconds
          </p>
        </div>

        {/* Step 1: URL Input */}
        {step === 'url' && (
          <motion.form
            onSubmit={handleUrlSubmit}
            className="space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div>
              <label
                htmlFor="website-url"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Your Website URL
              </label>
              <input
                id="website-url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="example.com"
                className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand transition-colors"
                required
              />
            </div>
            <div className="relative group">
              <div className="absolute inset-0 rounded-lg bg-black/80 translate-x-1 translate-y-1 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"></div>
              <Button
                type="submit"
                size="lg"
                className="relative w-full bg-brand text-primary-foreground border-[3px] border-border hover:bg-brand/90"
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.form>
        )}

        {/* Step 2: Email Input */}
        {step === 'email' && (
          <motion.form
            onSubmit={handleEmailSubmit}
            className="space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Your Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand transition-colors"
                required
              />
              <p className="mt-2 text-sm text-muted-foreground">
                We'll show you a demo of your site with our AI agent installed
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={handleBack}
                variant="outline"
                size="lg"
                className="flex-1 border-2 border-border"
              >
                Back
              </Button>
              <div className="relative group flex-1">
                <div className="absolute inset-0 rounded-lg bg-black/80 translate-x-1 translate-y-1 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"></div>
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="relative w-full bg-brand text-primary-foreground border-[3px] border-border hover:bg-brand/90"
                >
                  {isSubmitting ? 'Loading...' : 'See Demo'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.form>
        )}

        {/* Loading State */}
        {step === 'loading' && (
          <motion.div
            className="text-center py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand/10 rounded-full mb-4 animate-pulse">
              <Sparkles className="w-8 h-8 text-brand" />
            </div>
            <p className="text-lg text-muted-foreground">
              Preparing your demo...
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
