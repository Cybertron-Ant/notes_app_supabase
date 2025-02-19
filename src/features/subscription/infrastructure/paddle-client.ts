const PADDLE_VENDOR_ID = import.meta.env.VITE_PADDLE_VENDOR_ID;

export const initPaddle = () => {
  if (typeof window === "undefined" || window.Paddle) return;

  return new Promise<void>((resolve) => {
    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/paddle.js";
    script.async = true;
    script.onload = () => {
      if (window.Paddle) {
        window.Paddle.Setup({ vendor: PADDLE_VENDOR_ID });
        resolve();
      }
    };
    document.body.appendChild(script);
  });
};

export const openCheckout = async (planId: string) => {
  if (!window.Paddle) {
    await initPaddle();
  }

  if (!window.Paddle) {
    console.error("Failed to load Paddle");
    return;
  }

  window.Paddle.Checkout.open({
    product: planId,
    email: window.localStorage.getItem("userEmail") || undefined,
    successCallback: (data: any) => {
      console.log("Checkout complete", data);
    },
  });
};
