// 

import * as Linking from "expo-linking";

type PaymentParams = {
  checkoutUrl: string;
  redirectUrl: string;
};

type PaymentResult = {
  type: "payment-result";
  orderId: string;
  status: string;
};

export const openCashfreeCheckout = async ({
  checkoutUrl,
  redirectUrl,
}: PaymentParams): Promise<PaymentResult> => {
  return new Promise(async (resolve, reject) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const subscription = Linking.addEventListener("url", ({ url }) => {
      if (!url.startsWith(redirectUrl)) {
        return;
      }

      if (timeout) {
        clearTimeout(timeout);
      }

      subscription.remove();

      const parsed = Linking.parse(url);

      const orderId =
        typeof parsed.queryParams?.orderId === "string"
          ? parsed.queryParams.orderId
          : "";

      const status =
        typeof parsed.queryParams?.status === "string"
          ? parsed.queryParams.status
          : "";

      if (!orderId) {
        reject(new Error("Payment order ID was not received."));
        return;
      }

      resolve({
        type: "payment-result",
        orderId,
        status,
      });
    });

    try {
      await Linking.openURL(checkoutUrl);

      timeout = setTimeout(() => {
        subscription.remove();
        reject(
          new Error(
            "Payment was not completed or the app did not receive the payment result."
          )
        );
      }, 10 * 60 * 1000);
    } catch (error) {
      subscription.remove();

      reject(
        error instanceof Error
          ? error
          : new Error("Unable to open Cashfree checkout.")
      );
    }
  });
};