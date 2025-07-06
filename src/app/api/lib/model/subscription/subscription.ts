export type Subscription = {
  id: string;
  userId: string;
  stripeSubscriptionId: string;
  tier: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};
