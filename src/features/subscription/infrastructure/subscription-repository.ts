import { supabase } from "../../../lib/supabase";
import { SubscriptionPlan, UserSubscription } from "../domain/types";

type DbSubscriptionPlan = {
  id: string;
  name: string;
  paddle_plan_id: string;
  max_notes: number | null;
  price_usd: number;
};

type DbUserSubscription = {
  id: string;
  user_id: string;
  plan_id: string;
  paddle_subscription_id: string | null;
  status: "active" | "cancelled" | "past_due";
  current_period_start: string | null;
  current_period_end: string | null;
  plan?: DbSubscriptionPlan;
};

const mapSubscriptionPlan = (plan: DbSubscriptionPlan): SubscriptionPlan => ({
  id: plan.id,
  name: plan.name,
  paddlePlanId: plan.paddle_plan_id,
  maxNotes: plan.max_notes,
  priceUsd: plan.price_usd,
});

const mapUserSubscription = (sub: DbUserSubscription): UserSubscription => ({
  id: sub.id,
  userId: sub.user_id,
  planId: sub.plan_id,
  paddleSubscriptionId: sub.paddle_subscription_id || undefined,
  status: sub.status,
  currentPeriodStart: sub.current_period_start
    ? new Date(sub.current_period_start)
    : undefined,
  currentPeriodEnd: sub.current_period_end
    ? new Date(sub.current_period_end)
    : undefined,
  plan: sub.plan ? mapSubscriptionPlan(sub.plan) : undefined,
});

export const subscriptionRepository = {
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    const { data, error } = await supabase
      .from("user_subscriptions")
      .select(
        `
        *,
        plan:subscription_plans(*)
      `,
      )
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    if (!data) return null;

    return mapUserSubscription(data as DbUserSubscription);
  },

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const { data, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .order("price_usd");

    if (error) throw error;
    return (data as DbSubscriptionPlan[]).map(mapSubscriptionPlan);
  },

  async getUserNoteCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from("notes")
      .select("*", { count: "exact" })
      .eq("user_id", userId);

    if (error) throw error;
    return count || 0;
  },
};
