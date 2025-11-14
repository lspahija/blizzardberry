'use client';

import { motion } from 'framer-motion';
import { Calendar, Code, Sparkles } from 'lucide-react';

interface IntegrationSelectionStepProps {
  onSelectCustom: () => void;
  onSelectIntegration: (integration: string) => void;
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

export default function IntegrationSelectionStep({
  onSelectCustom,
  onSelectIntegration,
}: IntegrationSelectionStepProps) {
  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.p
        className="text-lg text-muted-foreground text-center"
        variants={itemVariants}
      >
        Choose how you'd like to create your action
      </motion.p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Custom Action Card */}
        <motion.button
          variants={itemVariants}
          onClick={onSelectCustom}
          className="group relative overflow-hidden rounded-xl border border-border bg-card p-8 text-left transition-all hover:border-primary hover:shadow-lg"
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full bg-primary/10 p-4 transition-colors group-hover:bg-primary/20">
              <Code className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Custom Action</h3>
            <p className="text-center text-muted-foreground">
              Build a custom action from scratch with full control over the
              configuration
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                API Calls
              </span>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Client Functions
              </span>
            </div>
          </div>
        </motion.button>

        {/* Prebuilt Integration Card */}
        <motion.button
          variants={itemVariants}
          onClick={() => onSelectIntegration('calendly')}
          className="group relative overflow-hidden rounded-xl border border-border bg-card p-8 text-left transition-all hover:border-primary hover:shadow-lg"
        >
          <div className="absolute right-4 top-4">
            <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500">
              <Sparkles className="h-3 w-3" />
              Quick Setup
            </span>
          </div>
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full bg-blue-500/10 p-4 transition-colors group-hover:bg-blue-500/20">
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">
              Calendly Integration
            </h3>
            <p className="text-center text-muted-foreground">
              Pre-configured actions to check availability and schedule meetings
              with Calendly
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-500">
                Get Availability
              </span>
              <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-500">
                Schedule Meetings
              </span>
            </div>
          </div>
        </motion.button>
      </div>
    </motion.div>
  );
}
