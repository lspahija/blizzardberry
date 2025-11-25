'use client';

import { Button } from '@/app/(frontend)/components/ui/button';
import { motion } from 'framer-motion';
import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import posthog from 'posthog-js';

export default function LoginPage() {
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isResendLoading, setIsResendLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const searchParams = useSearchParams();

  const intent = searchParams.get('intent');
  const intentData = searchParams.get('data');

  const redirectTo = intent ? '/continue-subscription' : '/dashboard';

  useEffect(() => {
    if (intent && intentData) {
      try {
        const parsedData = JSON.parse(intentData);
        sessionStorage.setItem(
          'subscriptionIntent',
          JSON.stringify({
            intent,
            data: parsedData,
          })
        );
      } catch (error) {
        console.error('Failed to parse subscription intent:', error);
      }
    }
  }, [intent, intentData]);

  const isSelfHosted = process.env.NEXT_PUBLIC_APP_MODE === 'self-hosted';

  useEffect(() => {
    if (isSelfHosted) {
      const autoLogin = async () => {
        setIsGitHubLoading(true);
        try {
          await signIn('credentials', { redirectTo });
        } catch (error) {
          setIsGitHubLoading(false);
          setError('Failed to auto-login as admin.');
        }
      };
      autoLogin();
    }
  }, [isSelfHosted, redirectTo]);

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
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const errorVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: 'auto', transition: { duration: 0.3 } },
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleGitHubSignIn = async () => {
    setIsGitHubLoading(true);
    setError('');
    try {
      posthog.capture('github_sign_in_attempt');
      await signIn('github', { redirectTo });
    } catch (error) {
      setIsGitHubLoading(false);
      setError('Failed to sign in with GitHub. Please try again.');
      posthog.capture('github_sign_in_failed', { error: error.message });
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError('');
    try {
      posthog.capture('google_sign_in_attempt');
      await signIn('google', { redirectTo });
    } catch (error) {
      setIsGoogleLoading(false);
      setError('Failed to sign in with Google. Please try again.');
      posthog.capture('google_sign_in_failed', { error: error.message });
    }
  };

  const handleResendSignIn = async () => {
    setError('');
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      posthog.capture('resend_sign_in_invalid_email', { email });
      return;
    }
    setIsResendLoading(true);
    try {
      posthog.capture('resend_sign_in_attempt', { email });
      await signIn('resend', { email, redirectTo });
    } catch (error) {
      setIsResendLoading(false);
      setError('Failed to send sign-in email. Please try again.');
      posthog.capture('resend_sign_in_failed', { email, error: error.message });
    }
  };

  return (
    <div className="bg-background flex items-center justify-center px-4 py-20">
      <motion.div
        className="max-w-sm w-full text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight"
          variants={itemVariants}
        >
          Sign In to BlizzardBerry
        </motion.h1>
        <motion.p
          className="text-lg text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed"
          variants={itemVariants}
        >
          Choose your preferred method to sign in
        </motion.p>
        <motion.div className="flex flex-col space-y-6" variants={itemVariants}>
          {error && (
            <motion.div
              className="text-destructive text-sm"
              variants={errorVariants}
              initial="hidden"
              animate="visible"
            >
              {error}
            </motion.div>
          )}
          {isSelfHosted ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Entering dashboard...</p>
            </div>
          ) : (
            <>
              <div className="relative group">
                <div className="absolute inset-0 rounded-lg bg-black/80 translate-x-1 translate-y-1 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"></div>
                <Button
                  size="lg"
                  className="relative w-full bg-background text-foreground border-[3px] border-border rounded-lg flex items-center justify-center hover:bg-secondary/90"
                  onClick={handleGitHubSignIn}
                  disabled={
                    isGitHubLoading || isGoogleLoading || isResendLoading
                  }
                >
                  <div className="flex items-center">
                    {isGitHubLoading ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <svg
                        role="img"
                        className="w-5 h-5 mr-2"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                      </svg>
                    )}
                    <span>
                      {isGitHubLoading
                        ? 'Signing in...'
                        : 'Sign in with GitHub'}
                    </span>
                  </div>
                </Button>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 rounded-lg bg-black/80 translate-x-1 translate-y-1 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"></div>
                <Button
                  size="lg"
                  className="relative w-full bg-background text-foreground border-[3px] border-border rounded-lg flex items-center justify-center hover:bg-secondary/90"
                  onClick={handleGoogleSignIn}
                  disabled={
                    isGitHubLoading || isGoogleLoading || isResendLoading
                  }
                >
                  <div className="flex items-center">
                    {isGoogleLoading ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <svg
                        role="img"
                        className="w-5 h-5 mr-2"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                      </svg>
                    )}
                    <span>
                      {isGoogleLoading
                        ? 'Signing in...'
                        : 'Sign in with Google'}
                    </span>
                  </div>
                </Button>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 rounded-lg bg-black/80 translate-x-1 translate-y-1 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"></div>
                <div className="relative w-full bg-background border-[3px] border-border rounded-lg p-4 flex flex-col space-y-3">
                  <input
                    type="email"
                    id="email-resend"
                    name="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 text-foreground bg-background border-[2px] border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-border"
                    disabled={
                      isGitHubLoading || isGoogleLoading || isResendLoading
                    }
                  />
                  <div className="relative group-inner">
                    <div className="absolute inset-0 rounded-lg bg-black/40 translate-x-0.5 translate-y-0.5 transition-transform group-inner-hover:translate-x-0.25 group-inner-hover:translate-y-0.25"></div>
                    <Button
                      size="lg"
                      className="relative w-full bg-background text-foreground border-[3px] border-border rounded-lg flex items-center justify-center hover:bg-secondary/90"
                      onClick={handleResendSignIn}
                      disabled={
                        isGitHubLoading ||
                        isGoogleLoading ||
                        isResendLoading ||
                        !email
                      }
                    >
                      <div className="flex items-center">
                        {isResendLoading ? (
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                          <svg
                            role="img"
                            className="w-5 h-5 mr-2"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M20 4H4C2.897 4 2 4.897 2 6v12c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zm0 2v.511l-8 6.223-8-6.222V6h16zM4 18V9.044l8 6.223 8-6.223V18H4z" />
                          </svg>
                        )}
                        <span>
                          {isResendLoading
                            ? 'Sending...'
                            : 'Sign in with Email'}
                        </span>
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
