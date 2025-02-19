import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { subscriptionRepository } from "../infrastructure/subscription-repository";
import { openCheckout } from "../infrastructure/paddle-client";
import { SubscriptionPlan } from "../domain/types";

interface UpgradeDialogProps {
  open: boolean;
  onClose: () => void;
  remainingNotes?: number;
}

export default function UpgradeDialog({
  open,
  onClose,
  remainingNotes,
}: UpgradeDialogProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

  useEffect(() => {
    const loadPlans = async () => {
      const plans = await subscriptionRepository.getSubscriptionPlans();
      setPlans(plans);
    };
    loadPlans();
  }, []);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upgrade to Pro</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6">
          {remainingNotes !== undefined && (
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                You have {remainingNotes} notes remaining on your free plan
              </p>
            </div>
          )}

          <div className="space-y-4">
            {plans.map((plan) => (
              <div key={plan.id} className="p-6 border rounded-lg space-y-2">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {plan.maxNotes
                    ? `Up to ${plan.maxNotes} notes`
                    : "Unlimited notes"}
                </p>
                <p className="text-2xl font-bold">
                  ${plan.priceUsd.toFixed(2)}
                  {plan.priceUsd > 0 && (
                    <span className="text-sm font-normal">/month</span>
                  )}
                </p>
                {plan.priceUsd > 0 && (
                  <Button
                    className="w-full"
                    onClick={() => openCheckout(plan.paddlePlanId)}
                  >
                    Upgrade to {plan.name}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
