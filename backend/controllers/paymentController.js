const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const Event = require("../models/event");
const Application = require("../models/application");
const RSVP = require("../models/rsvp");
const Payment = require("../models/payment");
const User = require("../models/user");
const { generateTicketNumber } = require("../utils/ticketGen");

let cashfree;

const cashfreeEnvironment = () =>
  process.env.CASHFREE_ENV === "production"
    ? "production"
    : "sandbox";

/* =========================================================
   CASHFREE INITIALIZATION
========================================================= */

const initializeCashfree = async () => {
  if (!cashfree) {
    const { Cashfree } = await import("cashfree-pg");

    cashfree = new Cashfree(
      process.env.CASHFREE_ENV === "production"
        ? Cashfree.PRODUCTION
        : Cashfree.SANDBOX,
      process.env.CASHFREE_APP_ID,
      process.env.CASHFREE_SECRET_KEY
    );
  }

  return cashfree;
};

/* =========================================================
   CHECKOUT URL
========================================================= */

const createCheckoutUrl = (payment) => {
  const checkoutToken = jwt.sign(
    {
      paymentId: String(payment._id),
      userId: String(payment.user),
      type: "CASHFREE_CHECKOUT",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m",
    }
  );

  return (
    `${process.env.RENDER_EXTERNAL_URL}/api/payments/checkout` +
    `?token=${encodeURIComponent(checkoutToken)}`
  );
};

/* =========================================================
   COMPLETE VISITOR RSVP
========================================================= */

const completeVisitorRsvp = async (payment) => {
  if (payment.purpose !== "VISITOR_RSVP") {
    return;
  }

  let rsvp = await RSVP.findOne({
    event: payment.event,
    visitor: payment.user,
  });

  if (!rsvp) {
    rsvp = await RSVP.create({
      event: payment.event,
      visitor: payment.user,
      status: "REGISTERED",
      paymentStatus: "PAID",
      ticketNumber: generateTicketNumber("VIS"),
    });
  } else {
    rsvp.status = "REGISTERED";
    rsvp.paymentStatus = "PAID";

    // Generate only once.
    // If payment verification happens again,
    // the same ticket number is preserved.
    if (!rsvp.ticketNumber) {
      rsvp.ticketNumber = generateTicketNumber("VIS");
    }

    await rsvp.save();
  }

  payment.rsvp = rsvp._id;
};

/* =========================================================
   GET CASHFREE PAYMENT STATUS
========================================================= */

const getCashfreePaymentStatus = async (orderId) => {
  const cf = await initializeCashfree();

  const response = await cf.PGOrderFetchPayments(orderId);

  const payments = response.data || [];

  /*
    Cashfree may temporarily return no payment records
    immediately after checkout.

    Treat that as PENDING instead of an error.
  */
  if (payments.length === 0) {
    return {
      status: "PENDING",
      payment: null,
    };
  }

  // Latest payment attempt
  const latestPayment = payments[payments.length - 1];

  const cashfreeStatus = latestPayment.payment_status;

  if (cashfreeStatus === "SUCCESS") {
    return {
      status: "SUCCESS",
      payment: latestPayment,
    };
  }

  if (
    cashfreeStatus === "FAILED" ||
    cashfreeStatus === "CANCELLED" ||
    cashfreeStatus === "USER_DROPPED"
  ) {
    return {
      status: "FAILED",
      payment: latestPayment,
    };
  }

  return {
    status: "PENDING",
    payment: latestPayment,
  };
};

/* =========================================================
   SMALL DELAY HELPER
========================================================= */

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/* =========================================================
   VERIFY CASHFREE PAYMENT WITH RETRIES
========================================================= */

const verifyCashfreePaymentWithRetry = async (
  orderId,
  attempts = 3,
  delayMs = 1500
) => {
  let lastResult = {
    status: "PENDING",
    payment: null,
  };

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      lastResult = await getCashfreePaymentStatus(orderId);

      console.log(
        `Cashfree verification attempt ${attempt}/${attempts}:`,
        orderId,
        lastResult.status
      );

      if (
        lastResult.status === "SUCCESS" ||
        lastResult.status === "FAILED"
      ) {
        return lastResult;
      }
    } catch (error) {
      console.error(
        `Cashfree verification attempt ${attempt} failed:`,
        error?.response?.data || error?.message || error
      );

      /*
        If this is the last attempt, let the caller handle
        the error/pending state.
        Otherwise retry.
      */
    }

    if (attempt < attempts) {
      await sleep(delayMs);
    }
  }

  return lastResult;
};

/* =========================================================
   FINALIZE SUCCESSFUL PAYMENT
========================================================= */

const finalizeSuccessfulPayment = async (
  payment,
  cashfreePayment = null
) => {
  /*
    Always make this operation safe to call multiple times.

    This is important because:
    - verify can be called multiple times
    - reconcile can be called later
    - Cashfree return URL can also run
  */

  payment.status = "SUCCESS";

  if (cashfreePayment?.cf_payment_id) {
    payment.cashfreePaymentId = String(
      cashfreePayment.cf_payment_id
    );
  }

  /*
    Save Payment first so the successful payment is
    persisted even if the related RSVP/application
    update takes a little longer.
  */
  await payment.save();

  /* -----------------------------------------------
     VISITOR
  ------------------------------------------------ */

  if (payment.purpose === "VISITOR_RSVP") {
    await completeVisitorRsvp(payment);

    /*
      completeVisitorRsvp updates payment.rsvp.
      Save it after the RSVP is created/found.
    */
    await payment.save();
  }

  /* -----------------------------------------------
     KAARIGAR
  ------------------------------------------------ */

  if (
    payment.purpose === "KAARIGAR_APPLICATION" &&
    payment.application
  ) {
    const application = await Application.findById(
      payment.application
    );

    if (application) {
      application.paymentStatus = "PAID";

      // Generate only once.
      // Repeated payment verification will keep
      // the same ticket number.
      if (!application.ticketNumber) {
        application.ticketNumber =
          generateTicketNumber("KRG");
      }

      await application.save();
    }
  }

  return payment;
};

/* =========================================================
   CREATE PAYMENT ORDER
========================================================= */

const createPaymentOrder = async (req, res) => {
  try {
    const { eventId, purpose } = req.body;

    if (!eventId || !purpose) {
      return res.status(400).json({
        message: "eventId and purpose are required",
      });
    }

    if (
      purpose !== "VISITOR_RSVP" &&
      purpose !== "KAARIGAR_APPLICATION"
    ) {
      return res.status(400).json({
        message: "Invalid payment purpose",
      });
    }

    /* -----------------------------------------------
       FIND EVENT
    ------------------------------------------------ */

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    /* -----------------------------------------------
       FIND USER
    ------------------------------------------------ */

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    let amount;
    let application = null;
    let rsvp = null;

    /* -----------------------------------------------
       VISITOR PAYMENT
    ------------------------------------------------ */

    if (purpose === "VISITOR_RSVP") {
      amount = event.visitorFee;

      rsvp = await RSVP.findOne({
        event: eventId,
        visitor: req.user.userId,
      });

      if (rsvp?.paymentStatus === "PAID") {
        return res.status(400).json({
          message: "This event is already paid for.",
        });
      }
    }

    /* -----------------------------------------------
       KAARIGAR PAYMENT
    ------------------------------------------------ */

    if (purpose === "KAARIGAR_APPLICATION") {
      amount = event.kaarigarFee;

      application = await Application.findOne({
        event: eventId,
        kaarigar: req.user.userId,
      });

      if (!application) {
        return res.status(404).json({
          message: "Application not found for this event.",
        });
      }

      if (application.status !== "APPROVED") {
        return res.status(400).json({
          message:
            "Payment is available only after Admin approves your application.",
        });
      }

      if (application.paymentStatus === "PAID") {
        return res.status(400).json({
          message: "This application is already paid for.",
        });
      }
    }

    /* -----------------------------------------------
       FREE EVENT
    ------------------------------------------------ */

    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: "No payment is required for this event.",
      });
    }

    /* -----------------------------------------------
       CHECK EXISTING SUCCESSFUL PAYMENT
    ------------------------------------------------ */

    const successfulPayment = await Payment.findOne({
      user: req.user.userId,
      event: eventId,
      purpose,
      status: "SUCCESS",
    });

    if (successfulPayment) {
      return res.status(400).json({
        message: "This payment has already been completed.",
      });
    }

    /* -----------------------------------------------
       RETURN EXISTING PENDING PAYMENT
    ------------------------------------------------ */

    const existingPayment = await Payment.findOne({
      user: req.user.userId,
      event: eventId,
      purpose,
      status: "PENDING",
    }).sort({ createdAt: -1 });

    if (
      existingPayment &&
      existingPayment.cashfreePaymentSessionId
    ) {
      const checkoutUrl = createCheckoutUrl(
        existingPayment
      );

      return res.status(200).json({
        message: "Existing pending payment found",

        paymentId: existingPayment._id,

        orderId: existingPayment.cashfreeOrderId,

        paymentSessionId:
          existingPayment.cashfreePaymentSessionId,

        environment: cashfreeEnvironment(),

        amount: existingPayment.amount,

        currency: existingPayment.currency,

        purpose: existingPayment.purpose,

        checkoutUrl,
      });
    }

    /* -----------------------------------------------
       CREATE CASHFREE ORDER
    ------------------------------------------------ */

    const cf = await initializeCashfree();

    const orderId = `KX_${crypto
      .randomUUID()
      .replace(/-/g, "")}`;

    const request = {
      order_amount: Number(amount),

      order_currency: "INR",

      order_id: orderId,

      customer_details: {
        customer_id: String(user._id),
        customer_name: user.name,
        customer_email: user.email,

        /*
          Replace this later with the actual user's
          phone number if your User model contains one.
        */
        customer_phone: "9876543210",
      },

      order_meta: {
        return_url:
          `${process.env.RENDER_EXTERNAL_URL}/api/payments/cashfree-return?order_id={order_id}`,
      },

      order_note:
        purpose === "VISITOR_RSVP"
          ? `Visitor RSVP - ${event.name}`
          : `Kaarigar Participation - ${event.name}`,
    };

    const response = await cf.PGCreateOrder(request);

    const cashfreeOrderId =
      response.data.order_id;

    const paymentSessionId =
      response.data.payment_session_id;

    if (
      !cashfreeOrderId ||
      !paymentSessionId
    ) {
      throw new Error(
        "Cashfree did not return a valid order ID and payment session ID"
      );
    }

    /* -----------------------------------------------
       SAVE PAYMENT AS PENDING
    ------------------------------------------------ */

    const payment = await Payment.create({
      user: req.user.userId,

      event: eventId,

      application: application?._id,

      rsvp: rsvp?._id,

      purpose,

      amount: Number(amount),

      currency: "INR",

      cashfreeOrderId,

      cashfreePaymentSessionId:
        paymentSessionId,

      status: "PENDING",
    });

    const checkoutUrl =
      createCheckoutUrl(payment);

    return res.status(201).json({
      message:
        "Cashfree order created successfully",

      paymentId: payment._id,

      orderId: cashfreeOrderId,

      paymentSessionId,

      environment: cashfreeEnvironment(),

      amount: Number(amount),

      currency: "INR",

      purpose,

      checkoutUrl,
    });
  } catch (error) {
    console.error(
      "Cashfree Create Order Error:",
      error?.response?.data || error?.message || error
    );

    return res.status(500).json({
      message:
        "Failed to create Cashfree payment order",

      error:
        error?.response?.data?.message ||
        error?.message ||
        "Unknown payment error",
    });
  }
};

/* =========================================================
   RENDER CASHFREE CHECKOUT
========================================================= */

const renderCashfreeCheckout = async (
  req,
  res
) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res
        .status(400)
        .send("Missing checkout token");
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (
      decoded.type !==
      "CASHFREE_CHECKOUT"
    ) {
      return res
        .status(401)
        .send("Invalid checkout token");
    }

    const payment =
      await Payment.findOne({
        _id: decoded.paymentId,
        user: decoded.userId,
      });

    if (!payment) {
      return res
        .status(404)
        .send("Payment not found");
    }

    if (payment.status === "SUCCESS") {
      return res
        .status(400)
        .send(
          "This payment is already completed."
        );
    }

    const mode =
      process.env.CASHFREE_ENV ===
      "production"
        ? "production"
        : "sandbox";

    const paymentSessionId =
      JSON.stringify(
        payment.cashfreePaymentSessionId
      );

    res.type("html").send(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>Kaarigar Expo Payment</title>

  <script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>
</head>

<body>
  <p>Opening secure payment...</p>

  <script>
    const cashfree = Cashfree({
      mode: ${JSON.stringify(mode)}
    });

    const paymentSessionId =
      ${paymentSessionId};

    cashfree.checkout({
      paymentSessionId: paymentSessionId
    });
  </script>
</body>
</html>
    `);
  } catch (error) {
    console.error(
      "Cashfree Checkout Page Error:",
      error
    );

    return res
      .status(400)
      .send(
        "Invalid or expired checkout session."
      );
  }
};

/* =========================================================
   VERIFY PAYMENT
========================================================= */

const verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        message: "orderId is required",
      });
    }

    /* -----------------------------------------------
       FIND PAYMENT
    ------------------------------------------------ */

    const payment =
      await Payment.findOne({
        cashfreeOrderId: orderId,
      });

    if (!payment) {
      return res.status(404).json({
        message:
          "Payment record not found",
      });
    }

    /* -----------------------------------------------
       OWNERSHIP CHECK
    ------------------------------------------------ */

    if (
      String(payment.user) !==
      String(req.user.userId)
    ) {
      return res.status(403).json({
        message:
          "You are not allowed to verify this payment",
      });
    }

    /* -----------------------------------------------
       ALREADY SUCCESSFUL
    ------------------------------------------------ */

    if (payment.status === "SUCCESS") {
      /*
        Make sure the linked RSVP/Application is also
        finalized. This makes the operation resilient
        if a previous request saved Payment but failed
        before updating the related document.
      */

      await finalizeSuccessfulPayment(
        payment,
        null
      );

      return res.status(200).json({
        message:
          "Payment already verified",
        status: "SUCCESS",
        paymentId: payment._id,
        amount: payment.amount,
      });
    }

    console.log(
      "VERIFY ORDER ID:",
      orderId
    );

    console.log(
      "CASHFREE ENV:",
      process.env.CASHFREE_ENV
    );

    console.log(
      "CASHFREE API VERSION:",
      process.env.CASHFREE_API_VERSION
    );

    /* -----------------------------------------------
       ASK CASHFREE WITH RETRIES
    ------------------------------------------------ */

    const result =
      await verifyCashfreePaymentWithRetry(
        orderId,
        3,
        1500
      );

    /* -----------------------------------------------
       SUCCESS
    ------------------------------------------------ */

    if (result.status === "SUCCESS") {
      await finalizeSuccessfulPayment(
        payment,
        result.payment
      );

      return res.status(200).json({
        message:
          "Payment verified successfully",

        status: "SUCCESS",

        paymentId: payment._id,

        cashfreePaymentId:
          result.payment?.cf_payment_id,

        amount: payment.amount,
      });
    }

    /* -----------------------------------------------
       FAILED
    ------------------------------------------------ */

    if (result.status === "FAILED") {
      payment.status = "FAILED";

      if (
        result.payment?.cf_payment_id
      ) {
        payment.cashfreePaymentId =
          String(
            result.payment.cf_payment_id
          );
      }

      await payment.save();

      return res.status(200).json({
        message:
          "Payment was not successful",

        status: "FAILED",
      });
    }

    /* -----------------------------------------------
       STILL PENDING
    ------------------------------------------------ */

    return res.status(200).json({
      message:
        "Payment is still processing",

      status: "PENDING",

      paymentId: payment._id,
    });
  } catch (error) {
    console.error(
      "Cashfree Verify Payment Error:",
      error?.response?.data ||
        error?.message ||
        error
    );

    return res.status(500).json({
      message:
        "Failed to verify payment",

      error:
        error?.response?.data?.message ||
        error?.message ||
        "Unknown payment verification error",
    });
  }
};

/* =========================================================
   RECONCILE USER'S PENDING PAYMENTS
========================================================= */

const reconcileMyPayments = async (
  req,
  res
) => {
  try {
    /*
      Find every pending payment belonging to this user.

      This is what allows payment recovery after:
      - app restart
      - browser refresh
      - closing the payment page
      - temporary Cashfree delay
    */

    const payments =
      await Payment.find({
        user: req.user.userId,
        status: "PENDING",
      }).sort({
        createdAt: -1,
      });

    if (payments.length === 0) {
      return res.status(200).json({
        message:
          "No pending payments",
        updated: 0,
      });
    }

    let updated = 0;

    for (const payment of payments) {
      try {
        const result =
          await getCashfreePaymentStatus(
            payment.cashfreeOrderId
          );

        console.log(
          "Reconciling payment:",
          payment.cashfreeOrderId,
          result.status
        );

        /* -----------------------------------------
           SUCCESS
        ------------------------------------------ */

        if (
          result.status === "SUCCESS"
        ) {
          await finalizeSuccessfulPayment(
            payment,
            result.payment
          );

          updated++;

          continue;
        }

        /* -----------------------------------------
           FAILED
        ------------------------------------------ */

        if (
          result.status === "FAILED"
        ) {
          payment.status = "FAILED";

          if (
            result.payment
              ?.cf_payment_id
          ) {
            payment.cashfreePaymentId =
              String(
                result.payment
                  .cf_payment_id
              );
          }

          await payment.save();

          updated++;
        }

        /*
          PENDING:
          Leave it as PENDING.
          It can be checked again next time
          the dashboard loads.
        */
      } catch (error) {
        /*
          Do not fail the whole reconciliation
          because one payment could not be checked.
        */

        console.error(
          `Failed to reconcile ${payment.cashfreeOrderId}:`,
          error?.response?.data ||
            error?.message ||
            error
        );
      }
    }

    return res.status(200).json({
      message:
        "Pending payments reconciled successfully",

      updated,
    });
  } catch (error) {
    console.error(
      "Reconcile Payments Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to reconcile pending payments",
    });
  }
};

/* =========================================================
   CASHFREE RETURN URL
========================================================= */

const cashfreeReturn = async (
  req,
  res
) => {
  try {
    const { order_id } = req.query;

    if (!order_id) {
      return res
        .status(400)
        .send(
          "Missing Cashfree order ID"
        );
    }

    const payment =
      await Payment.findOne({
        cashfreeOrderId: order_id,
      });

    if (!payment) {
      return res
        .status(404)
        .send(
          "Payment record not found"
        );
    }

    /*
      Use the same common verification logic
      here instead of duplicating the payment
      finalization code.
    */

    let status = "PENDING";

    try {
      const result =
        await verifyCashfreePaymentWithRetry(
          order_id,
          3,
          1500
        );

      if (
        result.status === "SUCCESS"
      ) {
        await finalizeSuccessfulPayment(
          payment,
          result.payment
        );

        status = "SUCCESS";
      } else if (
        result.status === "FAILED"
      ) {
        payment.status = "FAILED";

        if (
          result.payment
            ?.cf_payment_id
        ) {
          payment.cashfreePaymentId =
            String(
              result.payment
                .cf_payment_id
            );
        }

        await payment.save();

        status = "FAILED";
      }
    } catch (error) {
      console.error(
        "Cashfree Return Verification Error:",
        error?.response?.data ||
          error?.message ||
          error
      );
    }

    /*
      KEEP THE EXISTING MOBILE DEEP LINK.

      This is important because the same backend
      is being used by the Expo mobile application.
    */

    const appUrl =
      `mobileapp://payment-result` +
      `?orderId=${encodeURIComponent(
        order_id
      )}` +
      `&status=${encodeURIComponent(
        status
      )}`;

    return res.redirect(appUrl);
  } catch (error) {
    console.error(
      "Cashfree Return Error:",
      error
    );

    return res
      .status(500)
      .send(
        "Unable to process payment result."
      );
  }
};

/* =========================================================
   PAYMENT HISTORY
========================================================= */

const getMyPaymentHistory = async (
  req,
  res
) => {
  try {
    const { purpose } = req.query;

    const allowedPurposes = [
      "VISITOR_RSVP",
      "KAARIGAR_APPLICATION",
    ];

    if (
      purpose &&
      !allowedPurposes.includes(
        purpose
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid payment purpose",
      });
    }

    const filter = {
      user: req.user.userId,
    };

    if (purpose) {
      filter.purpose = purpose;
    }

    const payments =
      await Payment.find(filter)
        .populate(
          "event",
          "name date location"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      payments: payments.map(
        (payment) => ({
          paymentId: payment._id,

          event: payment.event,

          amount: payment.amount,

          currency: payment.currency,

          status: payment.status,

          purpose: payment.purpose,

          paymentDate:
            payment.createdAt,

          cashfreePaymentId:
            payment.cashfreePaymentId,

          cashfreeOrderId:
            payment.cashfreeOrderId,
        })
      ),
    });
  } catch (error) {
    console.error(
      "Payment History Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch payment history",
    });
  }
};

/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
  createPaymentOrder,
  verifyPayment,
  reconcileMyPayments,
  renderCashfreeCheckout,
  cashfreeReturn,
  getMyPaymentHistory,
};