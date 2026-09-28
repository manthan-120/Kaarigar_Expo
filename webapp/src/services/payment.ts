import { api } from "./api";

type PaymentVerification = {
  status: "SUCCESS" | "PENDING" | "FAILED";
};

const wait = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

type CashfreeCheckout = (options: {
  paymentSessionId: string;
  redirectTarget: "_modal" | "_self";
}) => Promise<void>;

declare global {
  interface Window {
    Cashfree?: (options: { mode: "sandbox" | "production" }) => {
      checkout: CashfreeCheckout;
    };
  }
}

const loadCashfree = async () => {
  if (window.Cashfree) return window.Cashfree;

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load Cashfree."));
    document.head.appendChild(script);
  });

  if (!window.Cashfree) {
    throw new Error("Cashfree checkout is unavailable.");
  }

  return window.Cashfree;
};

export async function payWithCashfree(
  eventId: string,
  purpose: "VISITOR_RSVP" | "KAARIGAR_APPLICATION"
): Promise<PaymentVerification> {
  try {
    const order = await api("/payments/create-order", {
      method: "POST",
      body: JSON.stringify({ eventId, purpose }),
    });

    if (!order.paymentSessionId || !order.orderId) {
      throw new Error("Payment session was not returned by the server.");
    }

    const Cashfree = await loadCashfree();
    const cashfree = Cashfree({
      mode: order.environment === "production" ? "production" : "sandbox",
    });

    void cashfree.checkout({
      paymentSessionId: order.paymentSessionId,
      redirectTarget: "_modal",
    }).catch(() => undefined);

    for (let attempt = 0; attempt < 100; attempt += 1) {
      await wait(3000);

      try {
        const verification = await api("/payments/verify", {
          method: "POST",
          body: JSON.stringify({ orderId: order.orderId }),
        });

        if (verification.status !== "PENDING") {
          return verification;
        }
      } catch {
        // Cashfree may not have recorded the payment yet. Keep polling.
      }
    }

    return { status: "PENDING" };
  } catch (error) {
    throw error;
  }
}