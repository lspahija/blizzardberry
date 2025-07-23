'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js';
import { useSearchParams } from 'next/navigation';
import {
  Check,
  Info,
  Loader2,
  Mail,
  MessageSquare,
  Send,
  Shield,
  Shovel,
  Star,
  Users,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { pricing } from '@/app/api/(main)/stripe/pricingModel';
import { toast } from 'sonner';
import {
  AgentModelDisplay,
  AgentModelList,
} from '@/app/api/lib/model/agent/agent';
import { useStripeSubscription } from '@/app/(frontend)/hooks/useStripeSubscription';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface Subscription {
  id: string;
  userId: string;
  stripeSubscriptionId: string;
  tier: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export default function UpgradePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const searchParams = useSearchParams();
  const { subscribe, buyCredits, isLoading } = useStripeSubscription();
  const [showCheckout, setShowCheckout] = useState<boolean>(false);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [checkoutSessionId, setCheckoutSessionId] = useState<string>('');
  const [showEnterpriseForm, setShowEnterpriseForm] = useState<boolean>(false);
  const [checkoutLoading, setCheckoutLoading] = useState<boolean>(false);
  const [emailAddress, setEmailAddress] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [formStatus, setFormStatus] = useState<string>('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(
    'monthly'
  );
  const [userSubscription, setUserSubscription] = useState<Subscription | null>(
    null
  );
  const [loadingSubscription, setLoadingSubscription] = useState<boolean>(true);
  const [subscriptionFetched, setSubscriptionFetched] =
    useState<boolean>(false);

  // Fetch user's current subscription
  useEffect(() => {
    const fetchSubscription = async () => {
      if (status === 'loading') {
        return;
      }
      if (!isLoggedIn || status !== 'authenticated') {
        setSubscriptionFetched(true);
        setLoadingSubscription(false);
        return;
      }

      try {
        const res = await fetch('/api/subscription', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) {
          throw new Error((await res.json()).error);
        }
        const { subscription }: { subscription: Subscription | null } =
          await res.json();
        setUserSubscription(subscription);
      } catch (err) {
        toast.error('Error fetching subscription: ' + (err as Error).message);
      } finally {
        setLoadingSubscription(false);
        setSubscriptionFetched(true);
      }
    };

    fetchSubscription();
  }, [isLoggedIn, status]);

  useEffect(() => {
    const shouldShowCheckout = searchParams.get('checkout') === 'true';
    const checkoutClientSecret = searchParams.get('clientSecret');
    const billingCycleParam = searchParams.get('billingCycle') as
      | 'monthly'
      | 'yearly';
    const tierParam = searchParams.get('tier');
    const actionParam = searchParams.get('action');

    console.log('Upgrade page useEffect:', {
      shouldShowCheckout,
      checkoutClientSecret: checkoutClientSecret ? 'present' : 'missing',
      billingCycleParam,
      tierParam,
      actionParam,
      isLoggedIn,
      sessionStatus: status,
      searchParamsString: searchParams.toString(),
    });

    if (status === 'loading') {
      return;
    }

    if (
      shouldShowCheckout &&
      checkoutClientSecret &&
      (isLoggedIn || status === 'authenticated')
    ) {
      console.log(
        'Setting up checkout with clientSecret:',
        checkoutClientSecret
      );
      setClientSecret(checkoutClientSecret);
      setShowCheckout(true);

      if (billingCycleParam) {
        setBillingCycle(billingCycleParam);
      }

      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('checkout');
      newUrl.searchParams.delete('clientSecret');
      newUrl.searchParams.delete('tier');
      newUrl.searchParams.delete('billingCycle');
      newUrl.searchParams.delete('action');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [searchParams, isLoggedIn, status]);

  const handleSubscribe = async (tier: string) => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    setCheckoutLoading(true);

    try {
      const data = await subscribe({ tier, billingCycle });

      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setShowCheckout(true);
      } else if (data.success) {
        toast.success('Your plan has been upgraded successfully!');
        window.location.reload();
      }
    } catch (err) {
      toast.error('Error: ' + (err as Error).message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleBuyCredits = async () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    setCheckoutLoading(true);
    try {
      const data = await buyCredits();
      setClientSecret(data.clientSecret);
      setCheckoutSessionId(data.checkoutSessionId || '');
      setShowCheckout(true);
    } catch (err) {
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleEnterpriseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('Submitting...');
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'Enterprise Inquiry',
          emailAddress,
          message,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send inquiry');
      }
      setFormStatus('Inquiry sent successfully!');
      setEmailAddress('');
      setMessage('');
      setTimeout(() => {
        setShowEnterpriseForm(false);
        setFormStatus('');
      }, 2000);
    } catch (err) {
      setFormStatus('Error: ' + (err as Error).message);
    }
  };

  const fetchClientSecret = useCallback(
    () => Promise.resolve(clientSecret),
    [clientSecret]
  );

  // Define tier order for non-enterprise tiers
  const tierOrder = ['free', 'hobby', 'standard', 'pro'];

  // Filter tiers to show only those more expensive than the current tier (excluding enterprise and free)
  const getAvailableTiers = () => {
    if (!subscriptionFetched) {
      return [];
    }
    const shouldShowCheckout = searchParams.get('checkout') === 'true';
    const checkoutClientSecret = searchParams.get('clientSecret');
    if (shouldShowCheckout && checkoutClientSecret) {
      return [];
    }

    if (!userSubscription || !userSubscription.tier) {
      return Object.entries(pricing.tiers).filter(
        ([key]) => key !== 'enterprise' && key !== 'free'
      );
    }

    const currentTierIndex = tierOrder.indexOf(
      userSubscription.tier.toLowerCase()
    );
    return Object.entries(pricing.tiers).filter(([key]) => {
      const tierIndex = tierOrder.indexOf(key);
      return (
        tierIndex > currentTierIndex && key !== 'enterprise' && key !== 'free'
      );
    });
  };

  const availableTiers = getAvailableTiers();

  // Enhanced descriptions for each tier
  const tierDescriptions = {
    free: 'Great for trying things out',
    hobby: 'Perfect for side projects and individual developers',
    standard: 'Ideal for growing teams and small businesses',
    pro: 'Built for power users and established companies',
    enterprise: 'Custom solutions for large organizations',
  };

  // Feature highlights for each tier
  const tierFeatures = {
    free: [],
    hobby: ['Premium models included', 'Support'],
    standard: ['Premium models included', 'Support'],
    pro: ['Premium models included', 'Support'],
    enterprise: ['Premium models included', 'Dedicated support'],
  };

  if (loadingSubscription) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-card p-8 rounded-2xl border border-border shadow-2xl flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-secondary animate-spin" />
          <h3 className="text-lg font-semibold text-foreground">
            Loading subscription details...
          </h3>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
  .tooltip-container {
    position: relative;
    display: inline-block;
  }

  .tooltip-text {
    text-decoration: underline;
    text-decoration-style: dotted;
    text-underline-offset: 4px;
    color: inherit;
    cursor: pointer;
    transition: color 0.2s ease, text-decoration-color 0.2s ease;
  }

  .tooltip-text:hover {
    text-decoration: underline;
    text-decoration-style: solid;
    color: #3b82f6;
  }

  .tooltip {
    visibility: hidden;
    opacity: 0;
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: #1f2937;
    color: #ffffff;
    padding: 12px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 10;
    min-width: 200px;
    max-width: 300px;
    font-size: 0.875rem;
    transition: opacity 0.2s ease, visibility 0.2s ease;
  }

  .tooltip-container:hover .tooltip {
    visibility: visible;
    opacity: 1;
  }
`}
      </style>
      <div className="bg-background">
        <div className="container mx-auto px-4 py-20 max-w-7xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-foreground leading-tight">
              Upgrade
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
              {userSubscription
                ? `Upgrade your ${userSubscription.tier} plan to unlock more features.`
                : 'Choose the perfect plan for your AI agent needs. Start free, scale as you grow.'}
            </p>

            <div className="flex justify-center gap-4 mb-12">
              <button
                className={`px-6 py-3 rounded-xl border font-semibold transition-all duration-200 ${
                  billingCycle === 'monthly'
                    ? 'bg-blue-100 text-foreground border-blue-200 shadow'
                    : 'bg-background text-foreground border-border hover:bg-muted'
                }`}
                onClick={() => setBillingCycle('monthly')}
              >
                Monthly
              </button>
              <button
                className={`px-6 py-3 rounded-xl border font-semibold transition-all duration-200 flex items-center gap-2 ${
                  billingCycle === 'yearly'
                    ? 'bg-blue-100 text-foreground border-blue-200 shadow'
                    : 'bg-background text-foreground border-border hover:bg-muted'
                }`}
                onClick={() => setBillingCycle('yearly')}
              >
                <span>Yearly</span>
                <span className="inline-block rounded-full bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 ml-2">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mb-20">
            {availableTiers.map(([key, tier]) => (
              <div
                key={key}
                className={`relative bg-card p-8 border border-border rounded-2xl transition-all duration-300 hover:shadow-lg flex flex-col items-stretch w-full max-w-sm ${
                  key === 'standard'
                    ? 'border-2 border-secondary shadow-lg pt-8 sm:pt-10 md:pt-8'
                    : ''
                }`}
                style={{ minHeight: 480, minWidth: '280px' }}
              >
                {billingCycle === 'yearly' && (
                  <span className="absolute top-4 right-4 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full border border-green-200 z-10">
                    -20%
                  </span>
                )}
                {key === 'standard' && (
                  <div className="absolute -top-1 sm:-top-2 md:-top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <span
                      className="bg-secondary text-secondary-foreground text-xs font-bold px-2 sm:px-3 py-1 rounded-full shadow border border-border"
                      style={{ letterSpacing: 0.5 }}
                    >
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-2">
                    {key === 'hobby' && (
                      <Zap className="h-6 w-6 text-secondary" />
                    )}
                    {key === 'standard' && (
                      <Star className="h-6 w-6 text-secondary" />
                    )}
                    {key === 'pro' && (
                      <Shield className="h-6 w-6 text-secondary" />
                    )}
                    <h2 className="text-2xl font-bold text-foreground">
                      {tier.name}
                    </h2>
                  </div>
                  <div className="mb-2 flex items-end gap-2">
                    {billingCycle === 'yearly' ? (
                      <>
                        <span className="text-xl font-semibold text-muted-foreground line-through mr-2">
                          ${tier.monthlyPrice}
                        </span>
                        <span className="text-4xl font-bold text-foreground">
                          ${(tier.yearlyPrice / 12).toFixed(0)}
                        </span>
                      </>
                    ) : (
                      <span className="text-4xl font-bold text-foreground">
                        ${tier.monthlyPrice}
                      </span>
                    )}
                    <span className="text-base text-muted-foreground mb-1 align-bottom">
                      /month
                    </span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      ${tier.yearlyPrice} billed annually
                    </p>
                  )}
                  <p className="text-muted-foreground font-medium mt-2">
                    {tierDescriptions[key as keyof typeof tierDescriptions]}
                  </p>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center justify-between p-2 bg-muted/40 rounded">
                    <span className="text-sm font-medium text-foreground">
                      Credits
                    </span>
                    <span className="text-base font-bold text-foreground">
                      {tier.credits.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted/40 rounded">
                    <span className="text-sm font-medium text-foreground">
                      Agents
                    </span>
                    <span className="text-base font-bold text-foreground">
                      {tier.agents}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted/40 rounded">
                    <span className="text-sm font-medium text-foreground">
                      Actions/Agent
                    </span>
                    <span className="text-base font-bold text-foreground">
                      {tier.actionsPerAgent}
                    </span>
                  </div>
                </div>

                <ul className="space-y-2 mb-8">
                  {tierFeatures[key as keyof typeof tierFeatures].map(
                    (feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-secondary flex-shrink-0" />
                        {feature === 'Premium models included' ? (
                          <div className="tooltip-container">
                            <span className="text-sm text-muted-foreground tooltip-text flex items-center gap-1">
                              {feature}
                              <Info className="h-4 w-4 text-secondary" />
                            </span>
                            <div className="tooltip">
                              <p className="font-semibold mb-2">
                                Premium Models:
                              </p>
                              <ul className="list-disc pl-4 space-y-1">
                                {AgentModelList.map((model) => (
                                  <li key={model}>
                                    {AgentModelDisplay[model]}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {feature}
                          </span>
                        )}
                      </li>
                    )
                  )}
                </ul>

                <button
                  className={`mt-auto w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 border ${
                    key === 'standard'
                      ? 'bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/90'
                      : 'bg-background text-foreground border-border hover:border-secondary hover:bg-secondary/10'
                  } ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                  onClick={() => handleSubscribe(key)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    'Upgrade'
                  )}
                </button>
              </div>
            ))}

            <div
              className="relative bg-card p-8 border border-border rounded-2xl transition-all duration-300 hover:shadow-lg flex flex-col items-stretch w-full max-w-sm"
              style={{ minHeight: 480, minWidth: '280px' }}
            >
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-6 w-6 text-secondary" />
                  <h2 className="text-2xl font-bold text-foreground">
                    Enterprise
                  </h2>
                </div>
                <div className="mb-2 flex items-end gap-2">
                  <span className="text-4xl font-bold text-foreground">
                    Custom
                  </span>
                </div>
                <p className="text-muted-foreground font-medium mt-2">
                  {tierDescriptions.enterprise}
                </p>
              </div>
              <div className="space-y-3 mb-8">
                <div className="flex items-center justify-between p-2 bg-muted/40 rounded">
                  <span className="text-sm font-medium text-foreground">
                    Credits
                  </span>
                  <span className="text-base font-bold text-foreground">
                    Unlimited
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/40 rounded">
                  <span className="text-sm font-medium text-foreground">
                    Agents
                  </span>
                  <span className="text-base font-bold text-foreground">
                    Unlimited
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/40 rounded">
                  <span className="text-sm font-medium text-foreground">
                    Support
                  </span>
                  <span className="text-base font-bold text-foreground">
                    24/7
                  </span>
                </div>
              </div>
              <ul className="space-y-2 mb-8">
                {tierFeatures.enterprise.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-secondary flex-shrink-0" />
                    {feature === 'Premium models included' ? (
                      <div className="tooltip-container">
                        <span className="text-sm text-muted-foreground tooltip-text flex items-center gap-1">
                          {feature}
                          <Info className="h-4 w-4 text-secondary" />
                        </span>
                        <div className="tooltip">
                          <p className="font-semibold mb-2">Premium Models:</p>
                          <ul className="list-disc pl-4 space-y-1">
                            {AgentModelList.map((model) => (
                              <li key={model}>{AgentModelDisplay[model]}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <button
                className="mt-auto w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 border bg-background text-foreground border-border hover:border-secondary hover:bg-secondary/10"
                onClick={() => setShowEnterpriseForm(true)}
              >
                Contact Sales
              </button>
            </div>
          </div>

          <div className="bg-card p-8 md:p-12 border border-border rounded-2xl text-center mb-16 shadow-sm">
            <div className="max-w-2xl mx-auto">
              <h2
                id="buy-credits"
                className="text-3xl md:text-4xl font-bold mb-4 text-foreground"
              >
                Need More Credits?
              </h2>
              <p className="text-lg md:text-xl mb-8 text-muted-foreground">
                Buy additional credits anytime. They never expire and are
                perfect for scaling your AI agents.
              </p>

              <div className="bg-background p-6 rounded-xl border border-border mb-8 flex flex-col md:flex-row items-center justify-center gap-4">
                <div className="text-center md:text-left">
                  <span className="text-4xl md:text-5xl font-bold text-foreground block">
                    {pricing.oneTimePurchase.credits.toLocaleString()}
                  </span>
                  <span className="text-lg text-muted-foreground">credits</span>
                </div>
                <div className="text-2xl text-muted-foreground">for</div>
                <div className="text-center md:text-left">
                  <span className="text-4xl md:text-5xl font-bold text-foreground-muted block">
                    ${pricing.oneTimePurchase.price}
                  </span>
                  <span className="text-lg text-muted-foreground">
                    one-time
                  </span>
                </div>
              </div>

              <button
                className={`py-4 px-8 bg-secondary text-secondary-foreground rounded-xl font-semibold hover:bg-secondary/90 transition-all duration-200 shadow ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                onClick={handleBuyCredits}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </div>
                ) : (
                  'Buy Credits Now'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showCheckout && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 sm:p-6 z-[100] backdrop-blur-sm"
          onClick={() => setShowCheckout(false)} // Close on backdrop click
        >
          <div
            className="bg-card border border-border rounded-2xl max-w-lg w-full shadow-2xl p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            <h2 className="text-2xl font-bold mb-6 text-foreground text-center">
              Complete Your Purchase
            </h2>
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{ fetchClientSecret }}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        </div>
      )}

      {showEnterpriseForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
          <div className="bg-card p-8 border border-border rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="flex items-center gap-3 mb-6">
              <Mail className="h-6 w-6 text-secondary" />
              <h2 className="text-2xl font-bold text-foreground">
                Enterprise Inquiry
              </h2>
            </div>
            <form onSubmit={handleEnterpriseSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="text-foreground text-base font-semibold flex items-center gap-2 mb-3"
                >
                  <Mail className="h-4 w-4 text-secondary" />
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  required
                  className="w-full p-4 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-200"
                  placeholder="your@company.com"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="text-foreground text-base font-semibold flex items-center gap-2 mb-3"
                >
                  <MessageSquare className="h-4 w-4 text-secondary" />
                  Tell us about your needs
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="w-full p-4 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-200"
                  rows={4}
                  placeholder="Describe your use case, team size, and specific requirements..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  className="px-6 py-3 border border-border text-foreground bg-background hover:bg-muted rounded-xl font-semibold transition"
                  onClick={() => {
                    setShowEnterpriseForm(false);
                    setEmailAddress('');
                    setMessage('');
                    setFormStatus('');
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-secondary text-secondary-foreground border border-secondary hover:bg-secondary/90 rounded-xl font-semibold transition flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Send Inquiry
                </button>
              </div>
            </form>
            {formStatus && (
              <p className="mt-4 text-center text-sm font-medium text-muted-foreground">
                {formStatus}
              </p>
            )}
          </div>
        </div>
      )}

      {checkoutLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-[200]">
          <div className="bg-card p-8 rounded-2xl border border-border shadow-2xl flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 text-secondary animate-spin" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Preparing your checkout...
              </h3>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
