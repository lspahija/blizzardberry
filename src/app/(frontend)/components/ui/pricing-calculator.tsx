'use client';

import { useEffect, useState } from 'react';
import { getPurchasableTiers, pricing } from '@/app/api/(main)/stripe/pricingModel';
import { DOLLARS_TO_CREDITS, MARKUP_PERCENTAGE } from '@/app/api/lib/llm/constants';
import { calculateEstimatedMessages } from '@/app/(frontend)/lib/usageCalculator';

interface ModelPrice {
  rawInput: number;
  rawOutput: number;
}

type CalculatorTab = 'per-message' | 'per-conversation';

export function PricingCalculator() {
  const [activeTab, setActiveTab] = useState<CalculatorTab>('per-message');
  const [modelPrices, setModelPrices] = useState<Record<
    string,
    ModelPrice
  > | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('');

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


  const calculateCostPerMessage = (price: number, credits: number) => {
    if (!selectedModel || !modelPrices || !modelPrices[selectedModel] || credits === 0) return 0;

    const avgInputTokens = 30;
    const avgOutputTokens = 120;
    const modelPrice = modelPrices[selectedModel];

    const creditsPerMessage =
      (avgInputTokens * modelPrice.rawInput * MARKUP_PERCENTAGE +
       avgOutputTokens * modelPrice.rawOutput * MARKUP_PERCENTAGE) * DOLLARS_TO_CREDITS;

    const costPerCredit = price / credits;

    return creditsPerMessage * costPerCredit;
  };

  const calculateCostPerConversation = (price: number, credits: number) => {
    if (!selectedModel || !modelPrices || !modelPrices[selectedModel] || credits === 0) return 0;
    
    const modelPrice = modelPrices[selectedModel];
    const conversationsPerCredits = calculateEstimatedMessages({
      credits: credits,
      modelPrice: modelPrice,
    });

    if (conversationsPerCredits === 0) return 0;

    return price / conversationsPerCredits;
  };

  return (
    <div className="bg-card border-2 border-border rounded-xl p-6">
      <div className="text-xl font-bold text-foreground mb-4">
        Usage Calculator
      </div>

      {/* Tabs */}
      <div className="flex mb-6 border-b-2 border-border">
        <button
          onClick={() => setActiveTab('per-message')}
          className={`flex-1 px-4 py-2 font-medium text-sm transition-all duration-200 border-b-2 -mb-[2px] ${
            activeTab === 'per-message'
              ? 'text-brand border-brand'
              : 'text-muted-foreground border-transparent hover:text-foreground'
          }`}
        >
          USD/Message
        </button>
        <button
          onClick={() => setActiveTab('per-conversation')}
          className={`flex-1 px-4 py-2 font-medium text-sm transition-all duration-200 border-b-2 -mb-[2px] ${
            activeTab === 'per-conversation'
              ? 'text-brand border-brand'
              : 'text-muted-foreground border-transparent hover:text-foreground'
          }`}
        >
          USD/Conversation
        </button>
      </div>

      {/* USD/Message Tab */}
      {activeTab === 'per-message' && (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Cost for the first message exchange (your message + AI response). Later messages cost more as conversation history grows.
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

            {selectedModel && modelPrices && (
              <div className="space-y-3 mt-4">
                <div className="text-sm font-medium text-foreground mb-2">
                  Monthly Billing:
                </div>
                {Object.entries(getPurchasableTiers())
                  .filter(([key]) => key !== 'enterprise')
                  .map(([tierKey, tier]) => {
                    const costPerMessage = calculateCostPerMessage(tier.monthlyPrice, tier.credits);
                    return (
                      <div
                        key={`${tierKey}-monthly-msg`}
                        className="flex items-center justify-between p-3 bg-muted/40 rounded-lg"
                      >
                        <div>
                          <div className="text-sm font-semibold text-foreground">
                            {tier.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ${tier.monthlyPrice}/mo
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-brand">
                            ${costPerMessage.toFixed(4)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            first exchange
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
                    const monthlyPrice = tier.yearlyPrice / 12;
                    const costPerMessage = calculateCostPerMessage(monthlyPrice, tier.credits);
                    return (
                      <div
                        key={`${tierKey}-yearly-msg`}
                        className="flex items-center justify-between p-3 bg-muted/40 rounded-lg"
                      >
                        <div>
                          <div className="text-sm font-semibold text-foreground">
                            {tier.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ${tier.yearlyPrice}/yr
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-brand">
                            ${costPerMessage.toFixed(4)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            first exchange
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
                      ${pricing.oneTimePurchase.price}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-brand">
                      ${calculateCostPerMessage(pricing.oneTimePurchase.price, pricing.oneTimePurchase.credits).toFixed(4)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      first exchange
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground mt-4 text-center">
                  Based on ~30 input tokens and ~120 output tokens for the first exchange
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* USD/Conversation Tab */}
      {activeTab === 'per-conversation' && (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Average cost per full conversation (5 message exchanges / 10 total messages). Context grows with each message.
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

            {selectedModel && modelPrices && (
              <div className="space-y-3 mt-4">
                <div className="text-sm font-medium text-foreground mb-2">
                  Monthly Billing:
                </div>
                {Object.entries(getPurchasableTiers())
                  .filter(([key]) => key !== 'enterprise')
                  .map(([tierKey, tier]) => {
                    const costPerConversation = calculateCostPerConversation(tier.monthlyPrice, tier.credits);
                    return (
                      <div
                        key={`${tierKey}-monthly-conv`}
                        className="flex items-center justify-between p-3 bg-muted/40 rounded-lg"
                      >
                        <div>
                          <div className="text-sm font-semibold text-foreground">
                            {tier.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ${tier.monthlyPrice}/mo
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-brand">
                            ${costPerConversation.toFixed(4)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            per conversation
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
                    const monthlyPrice = tier.yearlyPrice / 12;
                    const costPerConversation = calculateCostPerConversation(monthlyPrice, tier.credits);
                    return (
                      <div
                        key={`${tierKey}-yearly-conv`}
                        className="flex items-center justify-between p-3 bg-muted/40 rounded-lg"
                      >
                        <div>
                          <div className="text-sm font-semibold text-foreground">
                            {tier.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ${tier.yearlyPrice}/yr
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-brand">
                            ${costPerConversation.toFixed(4)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            per conversation
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
                      ${pricing.oneTimePurchase.price}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-brand">
                      ${calculateCostPerConversation(pricing.oneTimePurchase.price, pricing.oneTimePurchase.credits).toFixed(4)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      per conversation
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground mt-4 text-center">
                  Based on 5 message exchanges (10 total messages: 5 user + 5 AI)
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
