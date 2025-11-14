'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Check, Key } from 'lucide-react';
import { useState } from 'react';

interface CalendlyConfigStepProps {
  onBack: () => void;
  onCreate: (apiToken: string) => Promise<void>;
  isCreating: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function CalendlyConfigStep({
  onBack,
  onCreate,
  isCreating,
}: CalendlyConfigStepProps) {
  const [apiToken, setApiToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (apiToken.trim()) {
      await onCreate(apiToken);
    }
  };

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="flex items-center justify-center gap-3"
        variants={itemVariants}
      >
        <div className="rounded-full bg-blue-500/10 p-3">
          <Calendar className="h-6 w-6 text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          Configure Calendly Integration
        </h2>
      </motion.div>

      <motion.div
        className="rounded-xl border border-border bg-card p-6"
        variants={itemVariants}
      >
        <h3 className="mb-4 text-lg font-semibold text-foreground">
          What will be created:
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-green-500/10 p-1">
              <Check className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="font-medium text-foreground">Get Availability</p>
              <p className="text-sm text-muted-foreground">
                Query available time slots for your event types
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-green-500/10 p-1">
              <Check className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="font-medium text-foreground">Create Scheduling Link</p>
              <p className="text-sm text-muted-foreground">
                Generate single-use links for invitees to book meetings
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.form onSubmit={handleSubmit} className="space-y-6" variants={itemVariants}>
        <div className="space-y-2">
          <label
            htmlFor="apiToken"
            className="flex items-center gap-2 text-sm font-medium text-foreground"
          >
            <Key className="h-4 w-4" />
            Calendly Personal Access Token
          </label>
          <input
            id="apiToken"
            type="password"
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            placeholder="Enter your Calendly personal access token"
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            required
          />
          <p className="text-xs text-muted-foreground">
            Get your personal access token from{' '}
            <a
              href="https://calendly.com/integrations/api_webhooks"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Calendly Settings → Integrations & apps → API & Webhooks → Personal Access Tokens
            </a>
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onBack}
            disabled={isCreating}
            className="flex items-center gap-2 rounded-lg border border-border bg-background px-6 py-3 font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <button
            type="submit"
            disabled={!apiToken.trim() || isCreating}
            className="flex-1 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isCreating ? 'Creating Actions...' : 'Create Actions'}
          </button>
        </div>
      </motion.form>

      <motion.div
        className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4"
        variants={itemVariants}
      >
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Note:</span> Your personal access token will
          be stored and used to authenticate requests to Calendly on behalf of
          your agent.
        </p>
      </motion.div>
    </motion.div>
  );
}
