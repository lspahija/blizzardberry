interface PricingItem {
  name: string;
  priceId: string;
  credits: number;
}

interface Tier extends PricingItem {
  agents: number;
  actions: number;
}

interface OneTimePurchase extends PricingItem {}

interface Pricing {
  tiers: Record<string, Tier>;
  oneTimePurchase: OneTimePurchase;
}

export const pricing: Pricing = {
  tiers: {
    hobby: {
      name: 'Hobby',
      priceId: process.env.HOBBY_PLAN_PRICE_ID!,
      credits: 2000,
      agents: 1,
      actions: 8,
    },
    standard: {
      name: 'Standard',
      priceId: process.env.STANDARD_PLAN_PRICE_ID!,
      credits: 13000,
      agents: 2,
      actions: 16,
    },
    pro: {
      name: 'Pro',
      priceId: process.env.PRO_PLAN_PRICE_ID!,
      credits: 50000,
      agents: 3,
      actions: 24,
    },
  },
  oneTimePurchase: {
    name: '1,000 Credits',
    priceId: process.env.THOUSAND_CREDITS_PRICE_ID!,
    credits: 1000,
  },
};
