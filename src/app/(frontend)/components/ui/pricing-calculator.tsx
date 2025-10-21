'use client';

import { useEffect, useState } from 'react';
import { getPurchasableTiers } from '@/app/api/(main)/stripe/pricingModel';
import { DOLLARS_TO_CREDITS, MARKUP_PERCENTAGE } from '@/app/api/lib/llm/constants';
import { calculateEstimatedMessages } from '@/app/(frontend)/lib/usageCalculator';

interface ModelPrice {
  rawInput: number;
  rawOutput: number;
}

type CalculatorTab = 'conversations-per-tier' | 'credits-per-message' | 'credits-per-conversation';

export function PricingCalculator() {
  const [activeTab, setActiveTab] = useState<CalculatorTab>('conversations-per-tier');
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

  const calculateCreditsPerMessage = () => {
    if (!selectedModel || !modelPrices || !modelPrices[selectedModel]) return 0;

    const avgInputTokens = 30;
    const avgOutputTokens = 120;
    const modelPrice = modelPrices[selectedModel];

    const creditsPerMessage =
      (avgInputTokens * modelPrice.rawInput * MARKUP_PERCENTAGE +
       avgOutputTokens * modelPrice.rawOutput * MARKUP_PERCENTAGE) * DOLLARS_TO_CREDITS;

    return creditsPerMessage;
  };

  const calculateCreditsPerConversation = () => {
    if (!selectedModel || !modelPrices || !modelPrices[selectedModel]) return 0;

    const avgInputTokens = 30;
    const avgOutputTokens = 120;
    const avgMessagesPerConversation = 10; // 5 exchanges
    const modelPrice = modelPrices[selectedModel];

    // Sum of 1 + 2 + 3 + ... + N = N * (N + 1) / 2 (for context growth)
    const cumulativeMultiplier = (avgMessagesPerConversation * (avgMessagesPerConversation + 1)) / 2;

    const totalInputTokens = avgInputTokens * cumulativeMultiplier;
    const totalOutputTokens = avgOutputTokens * avgMessagesPerConversation;

    const creditsPerConversation =
      (totalInputTokens * modelPrice.rawInput * MARKUP_PERCENTAGE +
       totalOutputTokens * modelPrice.rawOutput * MARKUP_PERCENTAGE) * DOLLARS_TO_CREDITS;

    return creditsPerConversation;
  };

  return (
    <div className="bg-card border-2 border-border rounded-xl p-6">
      <div className="text-xl font-bold text-foreground mb-4">
        Usage Calculator
      </div>

      {/* Tabs */}
      <div className="flex mb-6 border-b-2 border-border">
        <button
          onClick={() => setActiveTab('conversations-per-tier')}
          className={`flex-1 px-4 py-2 font-medium text-sm transition-all duration-200 border-b-2 -mb-[2px] ${
            activeTab === 'conversations-per-tier'
              ? 'text-brand border-brand'
              : 'text-muted-foreground border-transparent hover:text-foreground'
          }`}
        >
          Conversations/Tier
        </button>
        <button
          onClick={() => setActiveTab('credits-per-message')}
          className={`flex-1 px-4 py-2 font-medium text-sm transition-all duration-200 border-b-2 -mb-[2px] ${
            activeTab === 'credits-per-message'
              ? 'text-brand border-brand'
              : 'text-muted-foreground border-transparent hover:text-foreground'
          }`}
        >
          Credits/Message
        </button>
        <button
          onClick={() => setActiveTab('credits-per-conversation')}
          className={`flex-1 px-4 py-2 font-medium text-sm transition-all duration-200 border-b-2 -mb-[2px] ${
            activeTab === 'credits-per-conversation'
              ? 'text-brand border-brand'
              : 'text-muted-foreground border-transparent hover:text-foreground'
          }`}
        >
          Credits/Conversation
        </button>
      </div>

      {/* Conversations/Tier Tab */}
      {activeTab === 'conversations-per-tier' && (
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
                  Based on 10 messages per conversation
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Credits/Message Tab */}
      {activeTab === 'credits-per-message' && (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Credits needed for one message.
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
              <div className="bg-gradient-to-br from-brand/10 to-brand/5 border-2 border-brand rounded-lg p-6 mt-4">
                <div className="text-sm text-muted-foreground mb-2">
                  Credits per message
                </div>
                <div className="text-4xl font-bold text-brand">
                  {calculateCreditsPerMessage().toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground mt-3">
                  Based on ~30 input tokens and ~120 output tokens
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Credits/Conversation Tab */}
      {activeTab === 'credits-per-conversation' && (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Credits needed for a full conversation. A conversation is approximately 10 messages.
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
              <div className="bg-gradient-to-br from-brand/10 to-brand/5 border-2 border-brand rounded-lg p-6 mt-4">
                <div className="text-sm text-muted-foreground mb-2">
                  Credits per conversation
                </div>
                <div className="text-4xl font-bold text-brand">
                  {calculateCreditsPerConversation().toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground mt-3">
                  Based on 10 messages per conversation
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
