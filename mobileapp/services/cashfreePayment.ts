import {
  CFErrorResponse,
  CFPaymentGatewayService,
} from "react-native-cashfree-pg-sdk";

import {
  CFEnvironment,
  CFSession,
} from "cashfree-pg-api-contract";

type PaymentParams = {
  orderId: string;
  paymentSessionId: string;
  environment?: "sandbox" | "production";
  onSuccess?: (orderId: string) => void;
  onFailure?: (
    error: CFErrorResponse,
    orderId: string
  ) => void;
};

export const openCashfreeCheckout = ({
  orderId,
  paymentSessionId,
  environment = "sandbox",
  onSuccess,
  onFailure,
}: PaymentParams) => {
  try {
    CFPaymentGatewayService.removeCallback();

    CFPaymentGatewayService.setCallback({
      onVerify: (verifiedOrderId: string) => {
        console.log(
          "Cashfree payment verified:",
          verifiedOrderId
        );

        onSuccess?.(verifiedOrderId);
      },

      onError: (
        error: CFErrorResponse,
        failedOrderId: string
      ) => {
        console.log(
          "Cashfree payment error:",
          error,
          failedOrderId
        );

        onFailure?.(error, failedOrderId);
      },
    });

    const cfEnvironment =
      environment === "production"
        ? CFEnvironment.PRODUCTION
        : CFEnvironment.SANDBOX;

    const session = new CFSession(
      paymentSessionId.trim(),
      orderId.trim(),
      cfEnvironment
    );

    console.log("Cashfree Session:", JSON.stringify(session));

    CFPaymentGatewayService.doWebPayment(session);
  } catch (error) {
    console.error(
      "Cashfree checkout error:",
      error
    );

    onFailure?.(
      error as CFErrorResponse,
      orderId
    );
  }
};