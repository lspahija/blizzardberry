'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface SuccessOverlayProps {
  title?: string;
  message?: string;
  showSpinner?: boolean;
  icon?: React.ReactNode;
}

export default function SuccessOverlay({
  title = 'Action Created Successfully!',
  message = 'Your action has been created and is ready to use.',
  showSpinner = true,
  icon,
}: SuccessOverlayProps) {
  return (
    <>
      {/* Full viewport backdrop blur */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998]"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 9998,
        }}
        aria-hidden="true"
      />
      {/* Success modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative bg-card border-[3px] border-border rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4"
          style={{ borderLeftColor: 'var(--color-destructive)' }}
        >
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              {icon || <Check className="h-6 w-6 text-red-600" />}
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {title}
            </h3>
            <p className="text-muted-foreground mb-6">{message}</p>
            {showSpinner && (
              <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
