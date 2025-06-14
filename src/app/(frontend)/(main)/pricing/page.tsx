'use client';

import { useState, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js';
import { Check, Mail, MessageSquare, X, Send } from 'lucide-react';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface CheckoutResponse {
  clientSecret: string;
  checkoutSessionId: string;
}

export default function PricingPage() {
  const [showCheckout, setShowCheckout] = useState<boolean>(false);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [checkoutSessionId, setCheckoutSessionId] = useState<string>('');
  const [showEnterpriseForm, setShowEnterpriseForm] = useState<boolean>(false);
  const [emailAddress, setEmailAddress] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [formStatus, setFormStatus] = useState<string>('');

  const handleSubscribe = async (tier: string) => {
    try {
      const res = await fetch('/api/stripe/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const { clientSecret, checkoutSessionId }: CheckoutResponse =
        await res.json();
      setClientSecret(clientSecret);
      setCheckoutSessionId(checkoutSessionId);
      setShowCheckout(true);
    } catch (err) {
      alert('Error initiating subscription: ' + (err as Error).message);
    }
  };

  const handleBuyCredits = async () => {
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
      alert('Error initiating credit purchase: ' + (err as Error).message);
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

  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-6 text-foreground">Pricing</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">Choose the perfect plan for your needs. All plans include our core features with different usage limits.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
        <div className="bg-card p-8 border-[2px] border-border rounded-xl hover:-translate-y-1 hover:-translate-x-1 transition-all duration-200 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-3 text-foreground group-hover:text-secondary transition-colors">Hobby</h2>
            <p className="text-4xl font-bold mb-2 text-foreground">$35<span className="text-lg font-normal text-muted-foreground">/month</span></p>
            <p className="text-sm text-muted-foreground font-medium">Perfect for side projects</p>
          </div>
          <ul className="space-y-4 mb-8 text-muted-foreground">
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-secondary group-hover:scale-110 transition-transform" />
              <span>2,000 credits</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-secondary group-hover:scale-110 transition-transform" />
              <span>8 actions</span>
            </li>
          </ul>
          <button
            className="w-full py-3 px-4 bg-secondary text-secondary-foreground border-[2px] border-border rounded-xl hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all duration-200 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-medium"
            onClick={() => handleSubscribe('hobby')}
          >
            Subscribe
          </button>
        </div>

        <div className="bg-card p-8 border-[2px] border-border rounded-xl hover:-translate-y-1 hover:-translate-x-1 transition-all duration-200 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-3 text-foreground group-hover:text-secondary transition-colors">Standard</h2>
            <p className="text-4xl font-bold mb-2 text-foreground">$150<span className="text-lg font-normal text-muted-foreground">/month</span></p>
            <p className="text-sm text-muted-foreground font-medium">Great for growing teams</p>
          </div>
          <ul className="space-y-4 mb-8 text-muted-foreground">
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-secondary group-hover:scale-110 transition-transform" />
              <span>13,000 credits</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-secondary group-hover:scale-110 transition-transform" />
              <span>16 actions</span>
            </li>
          </ul>
          <button
            className="w-full py-3 px-4 bg-secondary text-secondary-foreground border-[2px] border-border rounded-xl hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all duration-200 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-medium"
            onClick={() => handleSubscribe('standard')}
          >
            Subscribe
          </button>
        </div>

        <div className="bg-card p-8 border-[2px] border-border rounded-xl hover:-translate-y-1 hover:-translate-x-1 transition-all duration-200 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-3 text-foreground group-hover:text-secondary transition-colors">Pro</h2>
            <p className="text-4xl font-bold mb-2 text-foreground">$500<span className="text-lg font-normal text-muted-foreground">/month</span></p>
            <p className="text-sm text-muted-foreground font-medium">For power users</p>
          </div>
          <ul className="space-y-4 mb-8 text-muted-foreground">
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-secondary group-hover:scale-110 transition-transform" />
              <span>50,000 credits</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-secondary group-hover:scale-110 transition-transform" />
              <span>24 actions</span>
            </li>
          </ul>
          <button
            className="w-full py-3 px-4 bg-secondary text-secondary-foreground border-[2px] border-border rounded-xl hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all duration-200 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-medium"
            onClick={() => handleSubscribe('pro')}
          >
            Subscribe
          </button>
        </div>

        <div className="bg-card p-8 border-[2px] border-border rounded-xl hover:-translate-y-1 hover:-translate-x-1 transition-all duration-200 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-3 text-foreground group-hover:text-secondary transition-colors">Enterprise</h2>
            <p className="text-4xl font-bold mb-2 text-foreground">Custom</p>
            <p className="text-sm text-muted-foreground font-medium">For large organizations</p>
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

      <div className="bg-card p-8 border-[2px] border-border rounded-xl max-w-2xl mx-auto text-center hover:-translate-y-1 hover:-translate-x-1 transition-all duration-200 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group">
        <h2 className="text-2xl font-bold mb-4 text-foreground group-hover:text-secondary transition-colors">
          Need More Credits?
        </h2>
        <p className="text-lg mb-6 text-muted-foreground font-medium">Buy additional credits anytime. They never expire!</p>
        <div className="flex items-center justify-center gap-4 mb-6">
          <span className="text-4xl font-bold text-foreground">1,000 credits</span>
          <span className="text-xl text-muted-foreground">for</span>
          <span className="text-4xl font-bold text-foreground">$12</span>
        </div>
        <button
          className="py-3 px-8 bg-secondary text-secondary-foreground border-[2px] border-border rounded-xl hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all duration-200 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-medium"
          onClick={handleBuyCredits}
        >
          Buy Credits
        </button>
      </div>

      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card p-8 border-[2px] border-border rounded-xl max-w-lg w-full hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Complete Payment</h2>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card p-8 border-[3px] border-border border-l-8 border-l-brand rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="h-6 w-6 text-brand" />
              <h2 className="text-2xl font-bold text-foreground">Enterprise Inquiry</h2>
            </div>
            <form onSubmit={handleEnterpriseSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="text-foreground text-base font-semibold flex items-center gap-2 mb-2">
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
                <label htmlFor="message" className="text-foreground text-base font-semibold flex items-center gap-2 mb-2">
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
              <p className="mt-4 text-center text-sm font-medium text-muted-foreground">{formStatus}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
