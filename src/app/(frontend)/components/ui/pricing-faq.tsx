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
    <div className="bg-card p-6 sm:p-8 md:p-12 border-[3px] border-border rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:-translate-x-1 relative z-1">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
              Frequently Asked Questions
            </h2>
          </div>
        </div>

        <div className="space-y-4">
          {faqData.map((item, index) => (
            <div
              key={index}
              className="border border-border rounded-xl overflow-hidden bg-background"
            >
              <button
                className="w-full p-4 sm:p-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors duration-200"
                onClick={() => toggleItem(index)}
              >
                <span className="text-base sm:text-lg font-semibold text-foreground pr-4">
                  {item.question}
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-muted-foreground transition-transform duration-200 flex-shrink-0 ${
                    openItems.includes(index) ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openItems.includes(index) && (
                <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
