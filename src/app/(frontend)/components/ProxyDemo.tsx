'use client';

import { useState } from 'react';
import { Button } from '@/app/(frontend)/components/ui/button';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function ProxyDemo() {
  const [step, setStep] = useState<'url' | 'email' | 'loading'>('url');
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
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
      // Save the lead to database
      await fetch('/api/demo-leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          websiteUrl: normalizedUrl,
        }),
      });

      // Get the proxy URL
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

      // Redirect to the proxy page with the encoded URL
      window.location.href = `/proxy?url=${encodeURIComponent(data.proxyUrl)}`;
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


  return (
    <div className="w-full max-w-3xl mx-auto">
      <motion.div
        className="bg-card border-[3px] border-border rounded-2xl p-6 sm:p-8 shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="text-center mb-6">
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
            className="flex flex-col sm:flex-row gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <input
              id="website-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter your website URL"
              className="flex-1 px-4 py-2.5 bg-background border-2 border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand transition-colors text-sm sm:text-base"
              required
            />
            <div className="relative group w-full sm:w-auto">
              <div className="absolute inset-0 rounded-lg bg-black/80 translate-x-1 translate-y-1 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5 pointer-events-none"></div>
              <Button
                type="submit"
                className="relative w-full sm:w-auto bg-brand text-primary-foreground border-[3px] border-border hover:bg-brand/90 px-6 py-2.5 h-auto"
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
            className="space-y-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-background border-2 border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand transition-colors text-sm sm:text-base"
                required
              />
              <div className="flex gap-3 sm:gap-2">
                <div className="relative group flex-1 sm:flex-none">
                  <div className="absolute inset-0 rounded-lg bg-black/80 translate-x-1 translate-y-1 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5 pointer-events-none"></div>
                  <Button
                    type="button"
                    onClick={handleBack}
                    variant="outline"
                    className="relative w-full bg-background text-foreground border-[3px] border-border hover:bg-background/90 px-6 py-3 h-auto rounded-lg"
                  >
                    Back
                  </Button>
                </div>
                <div className="relative group flex-1 sm:flex-none">
                  <div className="absolute inset-0 rounded-lg bg-black/80 translate-x-1 translate-y-1 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5 pointer-events-none"></div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="relative w-full bg-brand text-primary-foreground border-[3px] border-border hover:bg-brand/90 px-6 py-3 h-auto rounded-lg"
                  >
                    {isSubmitting ? 'Loading...' : 'See Demo'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.form>
        )}

        {/* Loading State */}
        {step === 'loading' && (
          <motion.div
            className="text-center py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="inline-flex items-center gap-2 text-brand">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <p className="text-base font-medium">Preparing your demo...</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
