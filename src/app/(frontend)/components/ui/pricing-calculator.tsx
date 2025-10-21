'use client';

import { useEffect, useState } from 'react';
import { calculateEstimatedMessages } from '@/app/(frontend)/lib/usageCalculator';
import { getPurchasableTiers, pricing } from '@/app/api/(main)/stripe/pricingModel';

interface ModelPrice {
  rawInput: number;
  rawOutput: number;
}

type CalculatorTab = 'conversations' | 'per-credit';

export function PricingCalculator() {
  const [activeTab, setActiveTab] = useState<CalculatorTab>('conversations');
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

  const calculateCostPerCredit = (monthlyPrice: number, credits: number) => {
    if (credits === 0) return 0;
    return (monthlyPrice / credits);
  };

  const calculateYearlyCostPerCredit = (yearlyPrice: number, credits: number) => {
    if (credits === 0) return 0;
    const monthlyEquivalent = yearlyPrice / 12;
    return (monthlyEquivalent / credits);
  };

  return (
    <div className="bg-card border-2 border-border rounded-xl p-6">
      <div className="text-xl font-bold text-foreground mb-4">
        Usage Calculator
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b-2 border-border">
        <button
          onClick={() => setActiveTab('conversations')}
          className={`px-4 py-2 font-medium text-sm transition-all duration-200 border-b-2 -mb-[2px] ${
            activeTab === 'conversations'
              ? 'text-brand border-brand'
              : 'text-muted-foreground border-transparent hover:text-foreground'
          }`}
        >
          Conversations
        </button>
        <button
          onClick={() => setActiveTab('per-credit')}
          className={`px-4 py-2 font-medium text-sm transition-all duration-200 border-b-2 -mb-[2px] ${
            activeTab === 'per-credit'
              ? 'text-brand border-brand'
              : 'text-muted-foreground border-transparent hover:text-foreground'
          }`}
        >
          Cost Per Credit
        </button>
      </div>

      {/* Conversations Tab */}
      {activeTab === 'conversations' && (
        <>
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
        </>
      )}

      {/* Cost Per Credit Tab */}
      {activeTab === 'per-credit' && (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Compare the cost per credit across different plans and billing cycles.
          </p>

          <div className="space-y-3 mt-4">
            <div className="text-sm font-medium text-foreground mb-2">
              Monthly Billing:
            </div>
            {Object.entries(getPurchasableTiers())
              .filter(([key]) => key !== 'enterprise')
              .map(([tierKey, tier]) => {
                const costPerCredit = calculateCostPerCredit(tier.monthlyPrice, tier.credits);
                return (
                  <div
                    key={`${tierKey}-monthly`}
                    className="flex items-center justify-between p-3 bg-muted/40 rounded-lg"
                  >
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        {tier.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ${tier.monthlyPrice}/mo • {tier.credits.toLocaleString()} credits
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-brand">
                        ${costPerCredit.toFixed(4)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        per credit
                      </div>
                    </div>
                  </div>
                );
              })}

            <div className="text-sm font-medium text-foreground mb-2 mt-6">
              Yearly Billing (20% savings):
            </div>
            {Object.entries(getPurchasableTiers())
              .filter(([key]) => key !== 'enterprise')
              .map(([tierKey, tier]) => {
                const costPerCredit = calculateYearlyCostPerCredit(tier.yearlyPrice, tier.credits);
                return (
                  <div
                    key={`${tierKey}-yearly`}
                    className="flex items-center justify-between p-3 bg-muted/40 rounded-lg"
                  >
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        {tier.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ${tier.yearlyPrice}/yr • {tier.credits.toLocaleString()} credits/mo
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-brand">
                        ${costPerCredit.toFixed(4)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        per credit
                      </div>
                    </div>
                  </div>
                );
              })}

            <div className="text-sm font-medium text-foreground mb-2 mt-6">
              One-Time Purchase:
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
              <div>
                <div className="text-sm font-semibold text-foreground">
                  Credit Pack
                </div>
                <div className="text-xs text-muted-foreground">
                  ${pricing.oneTimePurchase.price} • {pricing.oneTimePurchase.credits.toLocaleString()} credits
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-brand">
                  ${(pricing.oneTimePurchase.price / pricing.oneTimePurchase.credits).toFixed(4)}
                </div>
                <div className="text-xs text-muted-foreground">
                  per credit
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground mt-4 text-center">
              Lower cost per credit means better value for your money
            </div>
          </div>
        </>
      )}
    </div>
  );
}
