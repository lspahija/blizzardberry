interface PricingItem {
  name: string;
  priceId: string | null;
  price: number;
  credits: number;
}

interface Tier extends PricingItem {
  agents: number;
  actionsPerAgent: number;
  yearlyPriceId: string | null;
  yearlyPrice: number;
}

interface OneTimePurchase extends PricingItem {}

interface Pricing {
  tiers: Record<string, Tier>;
  oneTimePurchase: OneTimePurchase;
}

export const pricing: Pricing = {
  tiers: {
    free: {
      name: 'Free',
      priceId: null,
      yearlyPriceId: null,
      price: 0,
      yearlyPrice: 0,
      credits: 100,
      agents: 1,
      actionsPerAgent: 2,
    },
    hobby: {
      name: 'Hobby',
      priceId: process.env.HOBBY_PLAN_MONTHLY_PRICE_ID!,
      yearlyPriceId: process.env.HOBBY_PLAN_YEARLY_PRICE_ID!,
      price: 35,
      yearlyPrice: 336, // 20% discount
      credits: 2000,
      agents: 1,
      actionsPerAgent: 8,
    },
    standard: {
      name: 'Standard',
      priceId: process.env.STANDARD_PLAN_MONTHLY_PRICE_ID!,
      yearlyPriceId: process.env.STANDARD_PLAN_YEARLY_PRICE_ID!,
      price: 150,
      yearlyPrice: 1440, // 20% discount
      credits: 13000,
      agents: 2,
      actionsPerAgent: 16,
    },
    pro: {
      name: 'Pro',
      priceId: process.env.PRO_PLAN_MONTHLY_PRICE_ID!,
      yearlyPriceId: process.env.PRO_PLAN_YEARLY_PRICE_ID!,
      price: 500,
      yearlyPrice: 4800, // 20% discount
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
