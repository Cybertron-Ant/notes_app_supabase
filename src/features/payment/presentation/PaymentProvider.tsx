import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../../../components/auth/AuthProvider";
import { paymentService } from "../application/payment-service";
import { SubscriptionLimits } from "../domain/types";

type PaymentContextType = {
  limits: SubscriptionLimits | null;
  loading: boolean;
  refetch: () => Promise<void>;
};

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [limits, setLimits] = useState<SubscriptionLimits | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLimits = async () => {
    if (!user) {
      setLimits(null);
      setLoading(false);
      return;
    }

    try {
      const limits = await paymentService.checkSubscriptionLimits(user.id);
      setLimits(limits);
    } catch (error) {
      console.error("Error fetching subscription limits:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLimits();
  }, [user]);

  return (
    <PaymentContext.Provider value={{ limits, loading, refetch: fetchLimits }}>
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayment() {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error("usePayment must be used within a PaymentProvider");
  }
  return context;
}
