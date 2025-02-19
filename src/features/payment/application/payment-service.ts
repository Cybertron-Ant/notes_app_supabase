import { paymentRepository } from "../infrastructure/payment-repository";
import { googlePayClient } from "../infrastructure/google-pay-client";
import { SubscriptionLimits, PaymentResult } from "../domain/types";

export const paymentService = {
  async checkSubscriptionLimits(userId: string): Promise<SubscriptionLimits> {
    const [subscription, noteCount] = await Promise.all([
      paymentRepository.getUserSubscription(userId),
      paymentRepository.getUserNoteCount(userId),
    ]);

    if (!subscription || !subscription.plan) {
      return { canCreateNote: false, isProMember: false };
    }

    const isProMember = subscription.plan.maxNotes === null;
    const notesRemaining = subscription.plan.maxNotes
      ? subscription.plan.maxNotes - noteCount
      : undefined;

    return {
      canCreateNote:
        isProMember || (notesRemaining ? notesRemaining > 0 : false),
      notesRemaining,
      isProMember,
    };
  },

  async processPayment(
    userId: string,
    planId: string,
    amount: number,
  ): Promise<PaymentResult> {
    try {
      await googlePayClient.initialize();
      const result = await googlePayClient.createPaymentRequest(amount);

      if (result.success && result.transactionId) {
        await paymentRepository.createSubscription(
          userId,
          planId,
          result.transactionId,
        );
      }

      return result;
    } catch (error) {
      console.error("Payment processing error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
};
