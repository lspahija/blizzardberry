export type Subscription = {
  id: string;
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripeSubscriptionItemId: string;
  tier: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};
