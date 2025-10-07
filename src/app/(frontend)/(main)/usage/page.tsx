'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/app/(frontend)/components/ui/button';
import { DOLLARS_TO_CREDITS, MARKUP_PERCENTAGE } from '@/app/api/lib/llm/constants';

interface ModelPrice {
  rawInput: number;
  rawOutput: number;
}

export default function UsagePage() {
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modelPrices, setModelPrices] = useState<Record<string, ModelPrice> | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [estimatedMessages, setEstimatedMessages] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/credits')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch credits');
        return res.json();
      })
      .then((data) => {
        setCredits(data.credits);
        setLoading(false);
      })
      .catch((err) => {
        setError('Could not load credits. Please try again.');
        setLoading(false);
      });

    fetch('/api/model-prices')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch model prices');
        return res.json();
      })
      .then((data) => {
        setModelPrices(data);
        const firstModel = 'openai/gpt-5';
        setSelectedModel(firstModel);
      })
      .catch((err) => {
        console.error('Failed to fetch model prices:', err);
      });
  }, []);

  useEffect(() => {
    if (credits && selectedModel && modelPrices && modelPrices[selectedModel]) {
      const model = modelPrices[selectedModel];
      const avgInputTokens = 30;
      const avgOutputTokens = 120;

      const costPerMessage =
        (avgInputTokens * model.rawInput * MARKUP_PERCENTAGE +
         avgOutputTokens * model.rawOutput * MARKUP_PERCENTAGE) * DOLLARS_TO_CREDITS;

      const messages = Math.floor(credits / costPerMessage);
      setEstimatedMessages(messages);
    }
  }, [credits, selectedModel, modelPrices]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-6 sm:mt-12">
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-6 sm:mb-8 text-foreground">
        Usage & Credits
      </h1>

      <div className="grid gap-6">
        {/* Credits Card */}
        <div className="bg-gradient-to-br from-brand/10 to-brand/5 border-4 border-brand rounded-2xl shadow-lg p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex-1">
              <div className="text-sm sm:text-base font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Available Credits
              </div>
              <div className="text-5xl sm:text-6xl font-extrabold text-brand mb-1">
                {loading ? '...' : error ? '—' : credits?.toLocaleString()}
              </div>
              <div className="text-sm sm:text-base text-muted-foreground">
                {loading
                  ? 'Loading your credits...'
                  : error || 'Credits remaining in your account'}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                asChild
                className="bg-brand text-primary-foreground border-[3px] border-border transition-all duration-200 font-semibold px-6 py-3 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:-translate-x-0.5 hover:bg-brand/90"
              >
                <Link href="/pricing#buy-credits">Buy More Credits</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Pricing Calculator */}
        <div className="bg-card border-2 border-border rounded-xl p-6">
          <div className="text-xl font-bold text-foreground mb-4">
            Usage Estimator
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Estimate how many messages you can send with your current credits.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Select Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-64 pl-4 pr-10 py-2 bg-background border-2 border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-brand appearance-none bg-[length:20px] bg-[position:right_0.75rem_center] bg-no-repeat"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`
                }}
                disabled={!modelPrices}
              >
                {modelPrices &&
                  Object.keys(modelPrices).map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
              </select>
            </div>

            {estimatedMessages !== null && (
              <div className="bg-gradient-to-br from-brand/10 to-brand/5 border-2 border-brand rounded-lg p-4 mt-4">
                <div className="text-sm text-muted-foreground mb-1">
                  Estimated number   of messages
                </div>
                <div className="text-3xl font-bold text-brand">
                  ~{estimatedMessages.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Based on average message size
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-card border-2 border-border rounded-xl p-5">
            <div className="text-lg font-bold text-foreground mb-2">
              How Credits Work
            </div>
            <p className="text-sm text-muted-foreground">
              Each API call consumes credits based on the complexity and length
              of the response. Monitor your usage to stay within your budget.
            </p>
          </div>

          <div className="bg-card border-2 border-border rounded-xl p-5">
            <div className="text-lg font-bold text-foreground mb-2">
              Need More?
            </div>
            <p className="text-sm text-muted-foreground">
              Purchase additional credits anytime to keep your services running
              smoothly. Purchased credits never expire.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
