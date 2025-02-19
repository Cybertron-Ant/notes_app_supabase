export interface SubscriptionPlan {
  id: string;
  name: string;
  paddlePlanId: string;
  maxNotes: number | null;
  priceUsd: number;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  paddleSubscriptionId?: string;
  status: "active" | "cancelled" | "past_due";
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  plan?: SubscriptionPlan;
}

export interface SubscriptionLimits {
  canCreateNote: boolean;
  notesRemaining?: number;
  isProMember: boolean;
}
