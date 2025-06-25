interface PricingItem {
  name: string;
  priceId: string;
  price: number;
  credits: number;
}

interface Tier extends PricingItem {
  agents: number;
  actionsPerAgent: number;
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
      price: 35,
      credits: 2000,
      agents: 1,
      actionsPerAgent: 8,
    },
    standard: {
      name: 'Standard',
      priceId: process.env.STANDARD_PLAN_PRICE_ID!,
      price: 150,
      credits: 13000,
      agents: 2,
      actionsPerAgent: 16,
    },
    pro: {
      name: 'Pro',
      priceId: process.env.PRO_PLAN_PRICE_ID!,
      price: 500,
      credits: 50000,
      agents: 3,
      actionsPerAgent: 24,
    },
  },
  oneTimePurchase: {
    name: '1,000 Credits',
    priceId: process.env.THOUSAND_CREDITS_PRICE_ID!,
    price: 12,
    credits: 1000,
  },
};
