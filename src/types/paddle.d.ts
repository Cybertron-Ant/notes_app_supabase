interface PaddleCheckout {
  open(options: {
    product: string;
    email?: string;
    successCallback?: (data: any) => void;
  }): void;
}

interface Paddle {
  Setup(options: { vendor: string }): void;
  Checkout: PaddleCheckout;
}

declare global {
  interface Window {
    Paddle?: Paddle;
  }
}
