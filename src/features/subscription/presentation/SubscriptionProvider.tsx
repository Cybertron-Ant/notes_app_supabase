import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../../../components/auth/AuthProvider";
import { subscriptionService } from "../application/subscription-service";
import { SubscriptionLimits } from "../domain/types";
import { initPaddle } from "../infrastructure/paddle-client";

type SubscriptionContextType = {
  limits: SubscriptionLimits | null;
  loading: boolean;
  refetch: () => Promise<void>;
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined,
);

export default function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [limits, setLimits] = useState<SubscriptionLimits | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPaddle = async () => {
      try {
        await initPaddle();
      } catch (error) {
        console.error("Failed to load Paddle:", error);
      }
    };
    loadPaddle();
  }, []);

  const fetchLimits = async () => {
    if (!user) {
      setLimits(null);
      setLoading(false);
      return;
    }

    try {
      const limits = await subscriptionService.checkSubscriptionLimits(user.id);
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
    <SubscriptionContext.Provider
      value={{ limits, loading, refetch: fetchLimits }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider",
    );
  }
  return context;
}
