import { useState, useEffect } from "react";
import { useAuth } from "../../../components/auth/AuthProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { paymentRepository } from "../infrastructure/payment-repository";
import { paymentService } from "../application/payment-service";
import { PaymentPlan } from "../domain/types";
import { toast } from "../../../components/ui/use-toast";
import { googlePayClient } from "../../../lib/google-pay";

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
  const { user } = useAuth();
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [processing, setProcessing] = useState(false);
  const [googlePayAvailable, setGooglePayAvailable] = useState(false);

  useEffect(() => {
    const loadPlans = async () => {
      const plans = await paymentRepository.getPaymentPlans();
      setPlans(plans);
    };
    loadPlans();

    const initGooglePay = async () => {
      try {
        const isAvailable = await googlePayClient.initialize();
        setGooglePayAvailable(!!isAvailable);
      } catch (error) {
        console.error("Failed to initialize Google Pay:", error);
      }
    };
    initGooglePay();
  }, []);

  const handlePayment = async (plan: PaymentPlan) => {
    if (!user) return;

    setProcessing(true);
    try {
      if (googlePayAvailable) {
        const paymentResult = await googlePayClient.createPaymentRequest(
          plan.priceUsd,
        );
        if (!paymentResult.success) {
          throw new Error(paymentResult.error || "Payment failed");
        }

        await paymentRepository.createSubscription(
          user.id,
          plan.id,
          paymentResult.transactionId!,
        );

        toast({
          title: "Payment successful",
          description: `You've been upgraded to ${plan.name}!`,
        });
        onClose();
      } else {
        // Fallback payment method
        toast({
          title: "Payment method not available",
          description: "Please try another payment method",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Payment failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

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
                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      onClick={() => handlePayment(plan)}
                      disabled={processing || !googlePayAvailable}
                    >
                      {processing
                        ? "Processing..."
                        : googlePayAvailable
                          ? "Pay with Google Pay"
                          : "Google Pay not available"}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
