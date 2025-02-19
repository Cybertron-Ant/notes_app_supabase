import { supabase } from "../../../lib/supabase";
import { PaymentPlan, UserSubscription } from "../domain/types";

type DbPaymentPlan = {
  id: string;
  name: string;
  max_notes: number | null;
  price_usd: number;
};

type DbUserSubscription = {
  id: string;
  user_id: string;
  plan_id: string;
  status: "active" | "cancelled" | "past_due";
  current_period_start: string | null;
  current_period_end: string | null;
  plan?: DbPaymentPlan;
};

const mapPaymentPlan = (plan: DbPaymentPlan): PaymentPlan => ({
  id: plan.id,
  name: plan.name,
  maxNotes: plan.max_notes,
  priceUsd: plan.price_usd,
});

const mapUserSubscription = (sub: DbUserSubscription): UserSubscription => ({
  id: sub.id,
  userId: sub.user_id,
  planId: sub.plan_id,
  status: sub.status,
  currentPeriodStart: sub.current_period_start
    ? new Date(sub.current_period_start)
    : undefined,
  currentPeriodEnd: sub.current_period_end
    ? new Date(sub.current_period_end)
    : undefined,
  plan: sub.plan ? mapPaymentPlan(sub.plan) : undefined,
});

export const paymentRepository = {
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    const { data, error } = await supabase
      .from("user_subscriptions")
      .select(
        `
        *,
        plan:payment_plans(*)
      `,
      )
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    if (!data) return null;

    return mapUserSubscription(data as DbUserSubscription);
  },

  async getPaymentPlans(): Promise<PaymentPlan[]> {
    const { data, error } = await supabase
      .from("payment_plans")
      .select("*")
      .order("price_usd");

    if (error) throw error;
    return (data as DbPaymentPlan[]).map(mapPaymentPlan);
  },

  async getUserNoteCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from("notes")
      .select("*", { count: "exact" })
      .eq("user_id", userId);

    if (error) throw error;
    return count || 0;
  },

  async createSubscription(
    userId: string,
    planId: string,
    transactionId: string,
  ): Promise<void> {
    const { data: plan } = await supabase
      .from("payment_plans")
      .select("price_usd")
      .eq("id", planId)
      .single();

    if (!plan) throw new Error("Plan not found");

    const { error: paymentError } = await supabase
      .from("user_payments")
      .insert({
        user_id: userId,
        plan_id: planId,
        transaction_id: transactionId,
        amount_usd: plan.price_usd,
      });

    if (paymentError) throw paymentError;

    const { error: subscriptionError } = await supabase
      .from("user_subscriptions")
      .upsert({
        user_id: userId,
        plan_id: planId,
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      });

    if (subscriptionError) throw subscriptionError;
  },
};
