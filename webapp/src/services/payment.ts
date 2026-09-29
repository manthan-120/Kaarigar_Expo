import { api } from "./api";

type PaymentVerification = {
  status: "SUCCESS" | "PENDING" | "FAILED";
  message?: string;
  paymentId?: string;
};

const wait = (milliseconds: number) =>
  new Promise((resolve) =>
    setTimeout(resolve, milliseconds)
  );

type CashfreeCheckout = (options: {
  paymentSessionId: string;
  redirectTarget: "_modal" | "_self";
}) => Promise<unknown>;

declare global {
  interface Window {
    Cashfree?: (options: {
      mode: "sandbox" | "production";
    }) => {
      checkout: CashfreeCheckout;
    };
  }
};

/* =====================================================
   LOAD CASHFREE SDK
===================================================== */

const loadCashfree = async () => {
  if (window.Cashfree) {
    return window.Cashfree;
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");

    script.src =
      "https://sdk.cashfree.com/js/v3/cashfree.js";

    script.onload = () => resolve();

    script.onerror = () =>
      reject(
        new Error("Unable to load Cashfree.")
      );

    document.head.appendChild(script);
  });

  if (!window.Cashfree) {
    throw new Error(
      "Cashfree checkout is unavailable."
    );
  }

  return window.Cashfree;
};

/* =====================================================
   VERIFY PAYMENT
===================================================== */

const verifyPayment = async (
  orderId: string
): Promise<PaymentVerification> => {
  console.log(
    "VERIFY API START:",
    orderId
  );

  const verification = await api(
    "/payments/verify",
    {
      method: "POST",

      body: JSON.stringify({
        orderId,
      }),
    }
  );

  console.log(
    "VERIFY API RESPONSE:",
    verification
  );

  return verification;
};

/* =====================================================
   PAY WITH CASHFREE
===================================================== */

export async function payWithCashfree(
  eventId: string,
  purpose:
    | "VISITOR_RSVP"
    | "KAARIGAR_APPLICATION"
): Promise<PaymentVerification> {
  /* ===================================================
     STEP 1
     CREATE PAYMENT ORDER
  =================================================== */

  console.log(
    "Creating Cashfree payment order..."
  );

  const order = await api(
    "/payments/create-order",
    {
      method: "POST",

      body: JSON.stringify({
        eventId,
        purpose,
      }),
    }
  );

  console.log(
    "Payment order created:",
    order.orderId
  );

  if (
    !order.paymentSessionId ||
    !order.orderId
  ) {
    throw new Error(
      "Payment session was not returned by the server."
    );
  }

  /* ===================================================
     STEP 2
     LOAD CASHFREE
  =================================================== */

  const Cashfree = await loadCashfree();

  const cashfree = Cashfree({
    mode:
      order.environment === "production"
        ? "production"
        : "sandbox",
  });

  /* ===================================================
     STEP 3
     OPEN CASHFREE CHECKOUT
  =================================================== */

  console.log(
    "Opening Cashfree checkout..."
  );

  try {
    await cashfree.checkout({
      paymentSessionId:
        order.paymentSessionId,

      redirectTarget: "_modal",
    });

    console.log(
      "Cashfree checkout closed/completed."
    );
  } catch (error) {
    console.error(
      "Cashfree checkout error:",
      error
    );

    /*
      Even if checkout rejects/closes,
      the payment may already have reached
      Cashfree, so we still verify the order.
    */
  }

  /* ===================================================
     STEP 4
     INITIAL VERIFICATION
  =================================================== */

  console.log(
    "Starting initial payment verification..."
  );

  try {
    const verification =
      await verifyPayment(
        order.orderId
      );

    if (
      verification.status === "SUCCESS" ||
      verification.status === "FAILED"
    ) {
      return verification;
    }

    console.log(
      "Initial verification is still PENDING."
    );
  } catch (error) {
    console.error(
      "Initial payment verification failed:",
      error
    );
  }

  /* ===================================================
     STEP 5
     POLL PAYMENT STATUS
  =================================================== */

  for (
    let attempt = 0;
    attempt < 20;
    attempt += 1
  ) {
    await wait(2000);

    console.log(
      `Calling verify API ${
        attempt + 1
      }/20...`
    );

    try {
      const verification =
        await verifyPayment(
          order.orderId
        );

      console.log(
        `Payment verification ${
          attempt + 1
        }/20:`,
        verification.status
      );

      if (
        verification.status === "SUCCESS" ||
        verification.status === "FAILED"
      ) {
        return verification;
      }
    } catch (error) {
      console.error(
        `Payment verification ${
          attempt + 1
        } failed:`,
        error
      );
    }
  }

  /* ===================================================
     STEP 6
     STILL PENDING
  =================================================== */

  console.log(
    "Payment verification finished after 20 attempts."
  );

  return {
    status: "PENDING",
    message:
      "Payment is still being processed. Please check your registration status again.",
  };
}
