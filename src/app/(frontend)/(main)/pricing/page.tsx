'use client';

import { useState, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js';
import { Check, Mail, MessageSquare, X, Send } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/app/(frontend)/components/Navbar';
import { pricing } from '@/app/api/(main)/stripe/pricingModel';
import { toast } from 'sonner';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface CheckoutResponse {
  clientSecret: string;
  checkoutSessionId: string;
}

export default function PricingPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [showCheckout, setShowCheckout] = useState<boolean>(false);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [checkoutSessionId, setCheckoutSessionId] = useState<string>('');
  const [showEnterpriseForm, setShowEnterpriseForm] = useState<boolean>(false);
  const [emailAddress, setEmailAddress] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [formStatus, setFormStatus] = useState<string>('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(
    'monthly'
  );

  const handleSubscribe = async (tier: string) => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('/api/stripe/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, billingCycle }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const { clientSecret, checkoutSessionId }: CheckoutResponse =
        await res.json();
      setClientSecret(clientSecret);
      setCheckoutSessionId(checkoutSessionId);
      setShowCheckout(true);
    } catch (err) {
      toast.error('Error initiating subscription: ' + (err as Error).message);
    }
  };

  const handleBuyCredits = async () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('/api/stripe/buy-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const { clientSecret, checkoutSessionId }: CheckoutResponse =
        await res.json();
      setClientSecret(clientSecret);
      setCheckoutSessionId(checkoutSessionId);
      setShowCheckout(true);
    } catch (err) {
      toast.error(
        'Error initiating credit purchase: ' + (err as Error).message
      );
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

  // Descriptions for each tier
  const tierDescriptions = {
    hobby: 'Perfect for side projects',
    standard: 'Great for growing teams',
    pro: 'For power users',
    enterprise: 'For large organizations',
  };

  return (
    <>
      {isLoggedIn && <Navbar />}
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="text-center mb-8 md:mb-16">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 text-foreground">
            Pricing
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
            Choose the perfect plan for your needs. All plans include our core
            features with different usage limits.
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <button
              className={`px-4 py-2 rounded-xl border-[2px] border-border font-medium ${
                billingCycle === 'monthly'
                  ? 'bg-secondary text-secondary-foreground'
                  : 'bg-background text-foreground hover:bg-muted'
              }`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
            <button
              className={`px-4 py-2 rounded-xl border-[2px] border-border font-medium ${
                billingCycle === 'yearly'
                  ? 'bg-secondary text-secondary-foreground'
                  : 'bg-background text-foreground hover:bg-muted'
              }`}
              onClick={() => setBillingCycle('yearly')}
            >
              Yearly (20% off)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-16 px-4">
          {Object.entries(pricing.tiers).map(([key, tier]) => (
            <div
              key={key}
              className={`bg-card p-8 border-[2px] border-border rounded-xl hover:-translate-y-1 hover:-translate-x-1 transition-all duration-200 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group relative ${
                key === 'standard'
                  ? 'border-secondary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : ''
              }`}
            >
              {key === 'standard' && (
                <span className="absolute top-2 right-2 bg-secondary text-secondary-foreground text-xs font-semibold px-2 py-1 rounded-full">
                  Popular
                </span>
              )}
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-3 text-foreground group-hover:text-secondary transition-colors">
                  {tier.name}
                </h2>
                <div className="flex flex-col items-start">
                  <p className="text-4xl font-bold mb-2 text-foreground">
                    $
                    {billingCycle === 'monthly'
                      ? tier.price
                      : (tier.yearlyPrice / 12).toFixed(2)}
                    <span className="text-lg font-normal text-muted-foreground">
                      /month
                    </span>
                  </p>
                  {billingCycle === 'yearly' && (
                    <p className="text-sm text-muted-foreground">
                      ${tier.yearlyPrice} billed annually
                    </p>
                  )}
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  {tierDescriptions[key as keyof typeof tierDescriptions]}
                </p>
              </div>
              <ul className="space-y-4 mb-8 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-secondary group-hover:scale-110 transition-transform" />
                  <span>{tier.credits.toLocaleString()} credits</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-secondary group-hover:scale-110 transition-transform" />
                  <span>
                    {tier.agents} agent{tier.agents !== 1 ? 's' : ''}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-secondary group-hover:scale-110 transition-transform" />
                  <span>{tier.actionsPerAgent} actions per agent</span>
                </li>
              </ul>
              <button
                className="w-full py-3 px-4 bg-secondary text-secondary-foreground border-[2px] border-border rounded-xl hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all duration-200 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-medium"
                onClick={() => handleSubscribe(key)}
              >
                Subscribe
              </button>
            </div>
          ))}

          <div className="bg-card p-8 border-[2px] border-border rounded-xl hover:-translate-y-1 hover:-translate-x-1 transition-all duration-200 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-3 text-foreground group-hover:text-secondary transition-colors">
                Enterprise
              </h2>
              <p className="text-4xl font-bold mb-2 text-foreground">Custom</p>
              <p className="text-sm text-muted-foreground font-medium">
                {tierDescriptions.enterprise}
              </p>
            </div>
            <ul className="space-y-4 mb-8 text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-secondary group-hover:scale-110 transition-transform" />
                <span>Custom credits</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-secondary group-hover:scale-110 transition-transform" />
                <span>Unlimited actions</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-secondary group-hover:scale-110 transition-transform" />
                <span>Dedicated support</span>
              </li>
            </ul>
            <button
              className="w-full py-3 px-4 bg-secondary text-secondary-foreground border-[2px] border-border rounded-xl hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all duration-200 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-medium"
              onClick={() => setShowEnterpriseForm(true)}
            >
              Contact Us
            </button>
          </div>
        </div>

        <div className="bg-card p-6 md:p-8 border-[2px] border-border rounded-xl max-w-2xl mx-auto text-center hover:-translate-y-1 hover:-translate-x-1 transition-all duration-200 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-foreground group-hover:text-secondary transition-colors">
            Need More Credits?
          </h2>
          <p className="text-base md:text-lg mb-6 text-muted-foreground font-medium">
            Buy additional credits anytime. They never expire!
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 mb-6">
            <span className="text-3xl md:text-4xl font-bold text-foreground">
              {pricing.oneTimePurchase.credits.toLocaleString()} credits
            </span>
            <span className="text-lg md:text-xl text-muted-foreground">
              for
            </span>
            <span className="text-3xl md:text-4xl font-bold text-foreground">
              ${pricing.oneTimePurchase.price}
            </span>
          </div>
          <button
            className="py-3 px-8 bg-secondary text-secondary-foreground border-[2px] border-border rounded-xl hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all duration-200 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-medium"
            onClick={handleBuyCredits}
          >
            Buy Credits
          </button>
        </div>

        {showCheckout && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
            <div className="bg-card p-8 border-[2px] border-border rounded-xl max-w-lg w-full hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                Complete Payment
              </h2>
              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{ fetchClientSecret }}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
              <button
                className="mt-4 py-2 px-6 bg-background text-brand border-[2px] border-brand rounded-xl hover:bg-muted transition font-medium mx-auto block"
                onClick={() => setShowCheckout(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {showEnterpriseForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
            <div className="bg-card p-8 border-[3px] border-border border-l-8 border-l-brand rounded-2xl shadow-2xl max-w-lg w-full">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="h-6 w-6 text-brand" />
                <h2 className="text-2xl font-bold text-foreground">
                  Enterprise Inquiry
                </h2>
              </div>
              <form onSubmit={handleEnterpriseSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="text-foreground text-base font-semibold flex items-center gap-2 mb-2"
                  >
                    <Mail className="h-4 w-4 text-brand" />
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    required
                    className="w-full p-3 border-[2px] border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-200"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="text-foreground text-base font-semibold flex items-center gap-2 mb-2"
                  >
                    <MessageSquare className="h-4 w-4 text-brand" />
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    className="w-full p-3 border-[2px] border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-200"
                    rows={4}
                    placeholder="Tell us about your needs..."
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    className="border-[2px] border-border text-primary-foreground bg-brand hover:bg-brand/90 rounded-xl flex items-center gap-2 px-3 py-1.5 text-sm font-semibold transition"
                    onClick={() => {
                      setShowEnterpriseForm(false);
                      setEmailAddress('');
                      setMessage('');
                      setFormStatus('');
                    }}
                  >
                    <X className="h-3 w-3" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-secondary text-secondary-foreground border-[2px] border-border hover:bg-muted rounded-xl flex items-center gap-2 px-3 py-1.5 text-sm font-semibold transition"
                  >
                    <Send className="h-3 w-3" />
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
      </div>
    </>
  );
}
