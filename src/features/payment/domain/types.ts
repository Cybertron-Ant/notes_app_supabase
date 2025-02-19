export interface PaymentPlan {
  id: string;
  name: string;
  maxNotes: number | null;
  priceUsd: number;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: "active" | "cancelled" | "past_due";
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  plan?: PaymentPlan;
}

export interface SubscriptionLimits {
  canCreateNote: boolean;
  notesRemaining?: number;
  isProMember: boolean;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}
