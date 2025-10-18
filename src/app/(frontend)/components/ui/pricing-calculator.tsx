'use client';

import { useEffect, useState } from 'react';
import { calculateEstimatedMessages } from '@/app/(frontend)/lib/usageCalculator';
import { getPurchasableTiers } from '@/app/api/(main)/stripe/pricingModel';

interface ModelPrice {
  rawInput: number;
  rawOutput: number;
}

export function PricingCalculator() {
  const [modelPrices, setModelPrices] = useState<Record<
    string,
    ModelPrice
  > | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [tierEstimates, setTierEstimates] = useState<Record<string, number>>(
    {}
  );

  useEffect(() => {
    fetch('/api/model-prices?sortBy=order')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch model prices');
        return res.json();
      })
      .then((data) => {
        setModelPrices(data);
        const firstModel = 'openai/gpt-5-mini';
        setSelectedModel(firstModel);
      })
      .catch((err) => {
        console.error('Failed to fetch model prices:', err);
      });
  }, []);

  useEffect(() => {
    if (selectedModel && modelPrices && modelPrices[selectedModel]) {
      const estimates: Record<string, number> = {};

      Object.entries(getPurchasableTiers()).forEach(([tierKey, tier]) => {
        const messages = calculateEstimatedMessages({
          credits: tier.credits,
          modelPrice: modelPrices[selectedModel],
        });
        estimates[tierKey] = messages;
      });

      setTierEstimates(estimates);
    }
  }, [selectedModel, modelPrices]);

  return (
    <div className="bg-card border-2 border-border rounded-xl p-6">
      <div className="text-xl font-bold text-foreground mb-4">
        Usage Calculator
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        See how many conversations you can have with each plan.
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
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
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

        {Object.keys(tierEstimates).length > 0 && (
          <div className="space-y-3 mt-4">
            <div className="text-sm font-medium text-foreground mb-2">
              Estimated conversations per plan:
            </div>
            {Object.entries(getPurchasableTiers()).map(([tierKey, tier]) => (
              <div
                key={tierKey}
                className="flex items-center justify-between p-3 bg-muted/40 rounded-lg"
              >
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {tier.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {tier.credits.toLocaleString()} credits
                  </div>
                </div>
                <div className="text-xl font-bold text-brand">
                  ~{tierEstimates[tierKey]?.toLocaleString() || 0}
                </div>
              </div>
            ))}
            <div className="text-xs text-muted-foreground mt-4 text-center">
              Based on average conversation length of 10 messages
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
