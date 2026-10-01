// 

import { AppState } from "react-native";
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
    let cancelTimer: ReturnType<typeof setTimeout> | null = null;
    let leftApp = false;
    let settled = false;

    const cleanup = () => {
      if (timeout) clearTimeout(timeout);
      if (cancelTimer) clearTimeout(cancelTimer);
      urlSubscription.remove();
      appStateSubscription.remove();
    };

    const cancelPayment = () => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error("Payment was cancelled before completion."));
    };

    const urlSubscription = Linking.addEventListener("url", ({ url }) => {
      if (!url.startsWith(redirectUrl)) {
        return;
      }

      if (settled) return;

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
        settled = true;
        cleanup();
        reject(new Error("Payment order ID was not received."));
        return;
      }

      settled = true;
      cleanup();
      resolve({
        type: "payment-result",
        orderId,
        status,
      });
    });

    const appStateSubscription = AppState.addEventListener(
      "change",
      (nextState) => {
        if (nextState === "background" || nextState === "inactive") {
          leftApp = true;
          return;
        }

        if (nextState === "active" && leftApp && !settled) {
          cancelTimer = setTimeout(cancelPayment, 700);
        }
      }
    );

    try {
      await Linking.openURL(checkoutUrl);

      timeout = setTimeout(() => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new Error("Payment timed out before completion."));
      }, 10 * 60 * 1000);
    } catch (error) {
      if (settled) return;
      settled = true;
      cleanup();

      reject(
        error instanceof Error
          ? error
          : new Error("Unable to open Cashfree checkout.")
      );
    }
  });
};