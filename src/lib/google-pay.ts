declare const google: any;

export class GooglePayClient {
  private paymentsClient: any;

  async initialize() {
    if (typeof window === "undefined") return;

    await this.loadGooglePayScript();

    this.paymentsClient = new google.payments.api.PaymentsClient({
      environment: "TEST", // Change to PRODUCTION for live
    });

    const isReadyToPay = await this.paymentsClient.isReadyToPay({
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [
        {
          type: "CARD",
          parameters: {
            allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
            allowedCardNetworks: ["MASTERCARD", "VISA"],
          },
        },
      ],
    });

    return isReadyToPay;
  }

  private loadGooglePayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined") return reject();
      if (window.google?.payments?.api) return resolve();

      const script = document.createElement("script");
      script.src = "https://pay.google.com/gp/p/js/pay.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.body.appendChild(script);
    });
  }

  async createPaymentRequest(amount: number) {
    const paymentDataRequest = {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [
        {
          type: "CARD",
          parameters: {
            allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
            allowedCardNetworks: ["MASTERCARD", "VISA"],
          },
          tokenizationSpecification: {
            type: "PAYMENT_GATEWAY",
            parameters: {
              gateway: "example",
              gatewayMerchantId: "exampleGatewayMerchantId",
            },
          },
        },
      ],
      merchantInfo: {
        merchantId: "12345678901234567890",
        merchantName: "Notes App",
      },
      transactionInfo: {
        totalPriceStatus: "FINAL",
        totalPrice: amount.toFixed(2),
        currencyCode: "USD",
      },
    };

    try {
      const paymentData =
        await this.paymentsClient.loadPaymentData(paymentDataRequest);
      return {
        success: true,
        transactionId: paymentData.paymentMethodData.tokenizationData.token,
      };
    } catch (err: any) {
      console.error("Error processing payment:", err);
      return {
        success: false,
        error: err.message,
      };
    }
  }
}

export const googlePayClient = new GooglePayClient();
