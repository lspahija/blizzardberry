'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SubscriptionIntent {
  intent: 'subscription' | 'credits';
  data: {
    tier?: string;
    billingCycle?: 'monthly' | 'yearly';
    action?: string;
  };
}

export default function ContinueSubscriptionPage() {
  const { isLoggedIn } = useAuth();
  const { status: sessionStatus } = useSession();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'processing' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Continuing your subscription...');

  useEffect(() => {
    const handleSubscriptionContinuation = async () => {
      if (sessionStatus === 'loading') {
        return;
      }
      
      if (!isLoggedIn) {
        setStatus('error');
        setMessage('Please log in to continue your subscription.');
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      try {
        const intentStr = sessionStorage.getItem('subscriptionIntent');
        if (!intentStr) {
          setStatus('error');
          setMessage('No subscription intent found.');
          setTimeout(() => router.push('/dashboard'), 2000);
          return;
        }

        const intent: SubscriptionIntent = JSON.parse(intentStr);
        setStatus('processing');

        if (intent.intent === 'subscription' && intent.data.tier) {
          setMessage('Processing your subscription...');
          
          const response = await fetch('/api/stripe/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tier: intent.data.tier,
              billingCycle: intent.data.billingCycle || 'monthly'
            }),
          });

          if (!response.ok) {
            throw new Error((await response.json()).error);
          }

          const data = await response.json();
          
          sessionStorage.removeItem('subscriptionIntent');
          
          if (data.clientSecret) {
            const returnUrl = new URL('/pricing', window.location.origin);
            returnUrl.searchParams.set('checkout', 'true');
            returnUrl.searchParams.set('clientSecret', data.clientSecret);
            returnUrl.searchParams.set('tier', intent.data.tier);
            returnUrl.searchParams.set('billingCycle', intent.data.billingCycle || 'monthly');
            
            setStatus('success');
            setMessage('Redirecting to complete your subscription...');
            setTimeout(() => router.push(returnUrl.toString()), 1000);
          } else if (data.success) {
            setStatus('success');
            setMessage('Your subscription has been updated successfully!');
            toast.success('Subscription updated successfully!');
            setTimeout(() => router.push('/pricing'), 2000);
          }

        } else if (intent.intent === 'credits') {
          setMessage('Processing your credit purchase...');
          
          const response = await fetch('/api/stripe/buy-credits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });

          if (!response.ok) {
            throw new Error((await response.json()).error);
          }

          const data = await response.json();
          
          sessionStorage.removeItem('subscriptionIntent');
          
          const returnUrl = new URL('/pricing', window.location.origin);
          returnUrl.searchParams.set('checkout', 'true');
          returnUrl.searchParams.set('clientSecret', data.clientSecret);
          returnUrl.searchParams.set('action', 'buy-credits');
          
          setStatus('success');
          setMessage('Redirecting to complete your purchase...');
          setTimeout(() => router.push(returnUrl.toString()), 1000);
        }

      } catch (error) {
        console.error('Error continuing subscription:', error);
        setStatus('error');
        setMessage('Failed to continue subscription: ' + (error as Error).message);
        toast.error('Failed to continue subscription: ' + (error as Error).message);
        
        sessionStorage.removeItem('subscriptionIntent');
        
        setTimeout(() => {
          router.push('/pricing');
        }, 3000);
      }
    };

    const timer = setTimeout(handleSubscriptionContinuation, 500);
    
    return () => clearTimeout(timer);
  }, [isLoggedIn, sessionStatus, router]);

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
        <div className="mb-6 flex justify-center">
          {getIcon()}
        </div>
        
        <h1 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
          {status === 'loading' && 'Setting up your subscription...'}
          {status === 'processing' && 'Processing...'}
          {status === 'success' && 'Almost there!'}
          {status === 'error' && 'Something went wrong'}
        </h1>
        
        <p className="text-lg text-muted-foreground mb-8">
          {message}
        </p>
        
        {status === 'loading' || status === 'processing' ? (
          <div className="text-sm text-muted-foreground">
            Please wait while we process your request...
          </div>
        ) : null}
      </motion.div>
    </div>
  );
} 