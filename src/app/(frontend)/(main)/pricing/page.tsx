'use client';

import { useState, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js';

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
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Pricing Plans</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="p-6 border rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-2">Hobby</h2>
          <p className="text-2xl font-bold mb-4">$35/month</p>
          <ul className="mb-4">
            <li>2,000 credits</li>
            <li>8 actions</li>
          </ul>
          <button
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => handleSubscribe('hobby')}
          >
            Subscribe
          </button>
        </div>
        <div className="p-6 border rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-2">Standard</h2>
          <p className="text-2xl font-bold mb-4">$150/month</p>
          <ul className="mb-4">
            <li>13,000 credits</li>
            <li>16 actions</li>
          </ul>
          <button
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => handleSubscribe('standard')}
          >
            Subscribe
          </button>
        </div>
        <div className="p-6 border rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-2">Pro</h2>
          <p className="text-2xl font-bold mb-4">$500/month</p>
          <ul className="mb-4">
            <li>50,000 credits</li>
            <li>24 actions</li>
          </ul>
          <button
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => handleSubscribe('pro')}
          >
            Subscribe
          </button>
        </div>
        <div className="p-6 border rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-2">Enterprise</h2>
          <p className="text-2xl font-bold mb-4">Custom</p>
          <ul className="mb-4">
            <li>Custom credits</li>
            <li>Unlimited actions</li>
            <li>Dedicated support</li>
          </ul>
          <button
            className="w-full p-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            onClick={() => setShowEnterpriseForm(true)}
          >
            Contact Us
          </button>
        </div>
      </div>
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Additional Credits</h2>
        <p className="mb-4">Buy 1,000 credits for $12 (no expiration)</p>
        <button
          className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={handleBuyCredits}
        >
          Buy Credits
        </button>
      </div>
      {showCheckout && (
        <div className="my-8 p-6 border rounded-lg bg-gray-50 max-w-lg mx-auto">
          <h2 className="text-xl font-semibold mb-4">Complete Payment</h2>
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{ fetchClientSecret }}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
          <button
            className="mt-4 p-2 bg-red-500 text-white rounded hover:bg-red-600 w-full"
            onClick={() => setShowCheckout(false)}
          >
            Cancel
          </button>
        </div>
      )}
      {showEnterpriseForm && (
        <div className="my-8 p-6 border rounded-lg bg-gray-50 max-w-lg mx-auto">
          <h2 className="text-xl font-semibold mb-4">Enterprise Inquiry</h2>
          <form onSubmit={handleEnterpriseSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                required
                className="w-full p-2 border rounded"
                placeholder="your@email.com"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="message" className="block mb-1">
                Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="w-full p-2 border rounded"
                rows={4}
                placeholder="Tell us about your needs..."
              />
            </div>
            <button
              type="submit"
              className="w-full p-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Send Inquiry
            </button>
            <button
              type="button"
              className="mt-2 w-full p-2 bg-red-500 text-white rounded hover:bg-red-600"
              onClick={() => {
                setShowEnterpriseForm(false);
                setEmailAddress('');
                setMessage('');
                setFormStatus('');
              }}
            >
              Cancel
            </button>
          </form>
          {formStatus && (
            <p className="mt-4 text-center text-sm">{formStatus}</p>
          )}
        </div>
      )}
    </div>
  );
}
