'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SessionStatus {
  status: string;
  customer_email: string | null;
}

function ReturnPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<
    'loading' | 'processing' | 'success' | 'error'
  >('loading');
  const [message, setMessage] = useState('Checking your payment status...');

  useEffect(() => {
    const handlePaymentStatus = async () => {
      const sessionId = searchParams.get('session_id');
      if (!sessionId) {
        setStatus('error');
        setMessage('No payment session found.');
        toast.error('No payment session found.');
        setTimeout(() => router.push('/pricing'), 2000);
        return;
      }

      try {
        setStatus('processing');
        setMessage('Verifying your payment...');

        const response = await fetch(
          `/api/stripe/session-status?session_id=${sessionId}`
        );
        const data: SessionStatus = await response.json();

        if (data.status === 'complete') {
          setStatus('success');
          setMessage('Payment successful! Redirecting to your dashboard...');
          toast.success('Payment completed successfully!');
          setTimeout(() => router.push('/dashboard'), 2000);
        } else if (data.status === 'open') {
          setStatus('error');
          setMessage('Payment failed or was canceled. Please try again.');
          toast.error('Payment failed or was canceled.');
          setTimeout(() => router.push('/pricing'), 2000);
        } else {
          throw new Error('Unexpected payment status.');
        }
      } catch (error) {
        console.error('Error fetching payment status:', error);
        setStatus('error');
        setMessage('Failed to verify payment: ' + (error as Error).message);
        toast.error('Failed to verify payment: ' + (error as Error).message);
        setTimeout(() => router.push('/pricing'), 3000);
      }
    };

    const timer = setTimeout(handlePaymentStatus, 500);

    return () => clearTimeout(timer);
  }, [searchParams, router]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const getIcon = () => {
    switch (status) {
      case 'loading':
      case 'processing':
        return <Loader2 className="h-12 w-12 text-primary animate-spin" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'error':
        return <XCircle className="h-12 w-12 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
      case 'processing':
        return 'text-primary';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        className="max-w-md w-full text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="mb-6 flex justify-center">{getIcon()}</div>

        <h1 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
          {status === 'loading' && 'Checking your payment...'}
          {status === 'processing' && 'Processing...'}
          {status === 'success' && 'Payment Successful!'}
          {status === 'error' && 'Something Went Wrong'}
        </h1>

        <p className="text-lg text-muted-foreground mb-8">{message}</p>

        {status === 'loading' || status === 'processing' ? (
          <div className="text-sm text-muted-foreground">
            Please wait while we process your request...
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}

export default function ReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-muted-foreground">
          Loading...
        </div>
      }
    >
      <ReturnPageContent />
    </Suspense>
  );
}
