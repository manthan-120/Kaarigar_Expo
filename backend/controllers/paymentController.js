const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const Event = require("../models/event");
const Application = require("../models/application");
const RSVP = require("../models/rsvp");
const Payment = require("../models/payment");
const User = require("../models/user");

let cashfree;

const cashfreeEnvironment = () =>
  process.env.CASHFREE_ENV === "production" ? "production" : "sandbox";

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

    // 1. Find event
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    //2.Find User
    const user = await User.findById(req.user.userId);

    if (!user) {
    return res.status(404).json({
        message: "User not found",
    });
    }

    let amount;
    let application = null;
    let rsvp = null;

    // --------------------------------------------------
    // VISITOR PAYMENT
    // --------------------------------------------------
    if (purpose === "VISITOR_RSVP") {
      amount = event.visitorFee;

      rsvp = await RSVP.findOne({
        event: eventId,
        visitor: req.user.userId,
      });

      if (!rsvp) {
        return res.status(400).json({
          message:
            "Please register for the event before making payment.",
        });
      }

      if (rsvp.status === "CANCELLED") {
        return res.status(400).json({
          message: "This RSVP has been cancelled.",
        });
      }

      if (rsvp.paymentStatus === "PAID") {
        return res.status(400).json({
          message: "This event is already paid for.",
        });
      }
    }

    // --------------------------------------------------
    // KAARIGAR PAYMENT
    // --------------------------------------------------
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

    // --------------------------------------------------
    // FREE EVENT
    // --------------------------------------------------
    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: "No payment is required for this event.",
      });
    }

    // --------------------------------------------------
    // RETURN EXISTING PENDING PAYMENT
    // --------------------------------------------------
    const existingPayment = await Payment.findOne({
      user: req.user.userId,
      event: eventId,
      purpose,
      status: "PENDING",
    });

    if (
      existingPayment &&
      existingPayment.cashfreePaymentSessionId
    ) {
      const checkoutUrl = createCheckoutUrl(
        existingPayment
      );

      return res.status(200).json({
        message: "Existing pending payment found",
        orderId: existingPayment.cashfreeOrderId,
        paymentSessionId:
          existingPayment.cashfreePaymentSessionId,
        environment: cashfreeEnvironment(),
        amount: existingPayment.amount,
        currency: existingPayment.currency,
        checkoutUrl,
      });
    }

    // --------------------------------------------------
    // CREATE CASHFREE ORDER
    // --------------------------------------------------
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

    const cashfreeOrderId = response.data.order_id;
    const paymentSessionId =
      response.data.payment_session_id;

    if (!cashfreeOrderId || !paymentSessionId) {
      throw new Error(
        "Cashfree did not return a valid order ID and payment session ID"
      );
    }

    // --------------------------------------------------
    // SAVE PAYMENT AS PENDING
    // --------------------------------------------------
    const payment = await Payment.create({
      user: req.user.userId,
      event: eventId,
      application: application?._id,
      rsvp: rsvp?._id,
      purpose,
      amount: Number(amount),
      currency: "INR",
      cashfreeOrderId,
      cashfreePaymentSessionId: paymentSessionId,
      status: "PENDING",
    });
    const checkoutUrl = createCheckoutUrl(payment);
    return res.status(201).json({
      message: "Cashfree order created successfully",

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
      error?.response?.data || error
    );

    return res.status(500).json({
      message: "Failed to create Cashfree payment order",
      error:
        error?.response?.data?.message ||
        error?.message ||
        "Unknown payment error",
    });
  }
};

const renderCashfreeCheckout = async (req, res) => {
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

    if (decoded.type !== "CASHFREE_CHECKOUT") {
      return res
        .status(401)
        .send("Invalid checkout token");
    }

    const payment = await Payment.findOne({
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
        .send("This payment is already completed.");
    }

    const mode =
      process.env.CASHFREE_ENV === "production"
        ? "production"
        : "sandbox";

    const paymentSessionId = JSON.stringify(
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
const verifyPayment = async (req, res) => {
  try {
    
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        message: "orderId is required",
      });
    }

    // Find our payment record
    const payment = await Payment.findOne({
      cashfreeOrderId: orderId,
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment record not found",
      });
    }

    // Make sure the logged-in user owns this payment
    if (String(payment.user) !== String(req.user.userId)) {
      return res.status(403).json({
        message: "You are not allowed to verify this payment",
      });
    }

    const cf = await initializeCashfree();
    console.log("VERIFY ORDER ID:", orderId);
    console.log(
    "CASHFREE API VERSION:",
    process.env.CASHFREE_API_VERSION
    );
    console.log(
    "CASHFREE ENV:",
    process.env.CASHFREE_ENV
    );
    // Get all payments for this Cashfree order
    const response = await cf.PGOrderFetchPayments(
        orderId
    );

    const payments = response.data || [];

    if (payments.length === 0) {
      return res.status(400).json({
        message: "No payment found for this order",
      });
    }

    // Use the latest payment attempt
    const latestPayment = payments[payments.length - 1];

    const paymentStatus = latestPayment.payment_status;

    if (paymentStatus === "SUCCESS") {
      payment.status = "SUCCESS";
      payment.cashfreePaymentId = String(
        latestPayment.cf_payment_id
      );

      await payment.save();

      // Update linked RSVP/Application
      if (
        payment.purpose === "VISITOR_RSVP" &&
        payment.rsvp
      ) {
        await RSVP.findByIdAndUpdate(payment.rsvp, {
          paymentStatus: "PAID",
        });
      }

      if (
        payment.purpose === "KAARIGAR_APPLICATION" &&
        payment.application
      ) {
        await Application.findByIdAndUpdate(
          payment.application,
          {
            paymentStatus: "PAID",
          }
        );
      }

      return res.status(200).json({
        message: "Payment verified successfully",
        status: "SUCCESS",
        paymentId: payment._id,
        cashfreePaymentId:
          latestPayment.cf_payment_id,
        amount: payment.amount,
      });
    }

    if (
      paymentStatus === "FAILED" ||
      paymentStatus === "CANCELLED"
    ) {
      payment.status = "FAILED";

      await payment.save();

      return res.status(200).json({
        message: "Payment was not successful",
        status: "FAILED",
      });
    }

    return res.status(200).json({
      message: "Payment is still pending",
      status: "PENDING",
    });
  } catch (error) {
    console.error(
      "Cashfree Verify Payment Error:",
      error?.response?.data || error
    );

    return res.status(500).json({
      message: "Failed to verify payment",
      error:
        error?.response?.data?.message ||
        error?.message ||
        "Unknown payment verification error",
    });
  }
};

const cashfreeReturn = async (req, res) => {
  try {
    const { order_id } = req.query;

    if (!order_id) {
      return res.status(400).send("Missing Cashfree order ID");
    }

    const payment = await Payment.findOne({
      cashfreeOrderId: order_id,
    });

    if (!payment) {
      return res.status(404).send("Payment record not found");
    }

    const cf = await initializeCashfree();

    let payments = [];

    try {
      const response = await cf.PGOrderFetchPayments(order_id);
      payments = response.data || [];
    } catch (error) {
      console.error(
        "Cashfree Return Verification Error:",
        error?.response?.data || error
      );
    }

    let status = "PENDING";

    if (payments.length > 0) {
      const latestPayment = payments[payments.length - 1];

      const paymentStatus = latestPayment.payment_status;

      if (paymentStatus === "SUCCESS") {
        payment.status = "SUCCESS";

        payment.cashfreePaymentId = String(
          latestPayment.cf_payment_id
        );

        await payment.save();

        if (
          payment.purpose === "KAARIGAR_APPLICATION" &&
          payment.application
        ) {
          await Application.findByIdAndUpdate(
            payment.application,
            {
              paymentStatus: "PAID",
            }
          );
        }

        if (
          payment.purpose === "VISITOR_RSVP" &&
          payment.rsvp
        ) {
          await RSVP.findByIdAndUpdate(
            payment.rsvp,
            {
              paymentStatus: "PAID",
            }
          );
        }

        status = "SUCCESS";
      } else if (
        paymentStatus === "FAILED" ||
        paymentStatus === "USER_DROPPED" ||
        paymentStatus === "CANCELLED"
      ) {
        payment.status = "FAILED";

        await payment.save();

        status = "FAILED";
      }
    }

    const appUrl =
      `mobileapp://payment-result` +
      `?orderId=${encodeURIComponent(order_id)}` +
      `&status=${encodeURIComponent(status)}`;

    return res.redirect(appUrl);
  } catch (error) {
    console.error("Cashfree Return Error:", error);

    return res.status(500).send(
      "Unable to process payment result."
    );
  }
};

const getMyPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({
      user: req.user.userId,
      purpose: "KAARIGAR_APPLICATION",
    })
      .populate("event", "name date location")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      payments: payments.map((payment) => ({
        paymentId: payment._id,
        event: payment.event,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paymentDate: payment.createdAt,
        cashfreePaymentId: payment.cashfreePaymentId,
        cashfreeOrderId: payment.cashfreeOrderId,
      })),
    });
  } catch (error) {
    console.error("Payment History Error:", error);

    return res.status(500).json({
      message: "Failed to fetch payment history",
    });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  renderCashfreeCheckout,
  cashfreeReturn,
  getMyPaymentHistory,
};