export type Subscription = {
  id: string;
  userId: string;
  stripeSubscriptionId: string;
  tier: string;
  createdAt: Date;
  updatedAt: Date;
};
