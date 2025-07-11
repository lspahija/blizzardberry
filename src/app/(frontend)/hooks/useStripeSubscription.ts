import { useState } from 'react';
import { toast } from 'sonner';

interface SubscribeParams {
  tier: string;
  billingCycle: 'monthly' | 'yearly';
}

interface CheckoutResponse {
  clientSecret: string;
  checkoutSessionId?: string;
  success?: boolean;
}

interface UseStripeSubscriptionReturn {
  isLoading: boolean;
  subscribe: (params: SubscribeParams) => Promise<CheckoutResponse>;
  buyCredits: () => Promise<CheckoutResponse>;
}

export function useStripeSubscription(): UseStripeSubscriptionReturn {
  const [isLoading, setIsLoading] = useState(false);

  const subscribe = async (
    params: SubscribeParams
  ): Promise<CheckoutResponse> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process subscription');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Error processing subscription: ${errorMessage}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const buyCredits = async (): Promise<CheckoutResponse> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/buy-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process credit purchase');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Error processing credit purchase: ${errorMessage}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    subscribe,
    buyCredits,
  };
}
