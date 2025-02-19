import { subscriptionRepository } from "../infrastructure/subscription-repository";
import { SubscriptionLimits } from "../domain/types";

export const subscriptionService = {
  async checkSubscriptionLimits(userId: string): Promise<SubscriptionLimits> {
    const [subscription, noteCount] = await Promise.all([
      subscriptionRepository.getUserSubscription(userId),
      subscriptionRepository.getUserNoteCount(userId),
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
};
