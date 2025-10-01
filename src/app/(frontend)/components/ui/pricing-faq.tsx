'use client';

import { ChevronDown, HelpCircle } from 'lucide-react';
import { useState } from 'react';

const faqData = [
  {
    question: 'How do credits work?',
    answer:
      "Each request made to an AI model costs credits. The exact amount depends on the specific model you're using and the length of the conversation.",
  },
  {
    question: 'Do credits expire?',
    answer:
      'Credits included with your subscription tier expire when your subscription period ends. However, credits purchased separately as one-time purchases never expire.',
  },
  {
    question: 'When are my credits renewed?',
    answer:
      'Your credits are renewed at the start of your next billing cycle when your subscription renews.',
  },
];

export function PricingFAQ() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="bg-card p-8 sm:p-10 border-[3px] border-border rounded-2xl shadow-lg transition-all duration-300 relative max-w-3xl mx-auto">
      <div>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand/10 mb-4">
            <HelpCircle className="h-6 w-6 text-brand" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Everything you need to know about our pricing and credits
          </p>
        </div>

        <div className="space-y-3">
          {faqData.map((item, index) => (
            <div
              key={index}
              className="border-2 border-border rounded-xl overflow-hidden bg-background/50 hover:border-brand/40 transition-all duration-200"
            >
              <button
                className="w-full p-5 text-left flex items-center justify-between hover:bg-muted/20 transition-colors duration-200 group"
                onClick={() => toggleItem(index)}
              >
                <span className="text-sm sm:text-base font-semibold text-foreground pr-4 group-hover:text-brand transition-colors duration-200">
                  {item.question}
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-muted-foreground transition-all duration-200 flex-shrink-0 group-hover:text-brand ${
                    openItems.includes(index) ? 'rotate-180 text-brand' : ''
                  }`}
                />
              </button>
              {openItems.includes(index) && (
                <div className="border-t-2 border-border/50 bg-muted/10">
                  <div className="px-5 py-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
