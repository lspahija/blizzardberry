interface Tier {
  name: string;
  agents: number;
  actionsPerAgent: number;
  monthlyPriceId: string | null;
  monthlyPrice: number;
  yearlyPriceId: string | null;
  yearlyPrice: number;
  credits: number;
}

interface OneTimePurchase {
  name: string;
  priceId: string | null;
  price: number;
  credits: number;
}

interface Pricing {
  tiers: Record<string, Tier>;
  oneTimePurchase: OneTimePurchase;
}

export const pricing: Pricing = {
  tiers: {
    free: {
      name: 'Free',
      monthlyPriceId: null,
      yearlyPriceId: null,
      monthlyPrice: 0,
      yearlyPrice: 0,
      credits: 100,
      agents: 1,
      actionsPerAgent: 2,
    },
    hobby: {
      name: 'Hobby',
      monthlyPriceId: process.env.HOBBY_PLAN_MONTHLY_PRICE_ID!,
      yearlyPriceId: process.env.HOBBY_PLAN_YEARLY_PRICE_ID!,
      monthlyPrice: 35,
      yearlyPrice: 336, // 20% discount
      credits: 2000,
      agents: 1,
      actionsPerAgent: 8,
    },
    standard: {
      name: 'Standard',
      monthlyPriceId: process.env.STANDARD_PLAN_MONTHLY_PRICE_ID!,
      yearlyPriceId: process.env.STANDARD_PLAN_YEARLY_PRICE_ID!,
      monthlyPrice: 150,
      yearlyPrice: 1440, // 20% discount
      credits: 13000,
      agents: 2,
      actionsPerAgent: 16,
    },
    pro: {
      name: 'Pro',
      monthlyPriceId: process.env.PRO_PLAN_MONTHLY_PRICE_ID!,
      yearlyPriceId: process.env.PRO_PLAN_YEARLY_PRICE_ID!,
      monthlyPrice: 500,
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
