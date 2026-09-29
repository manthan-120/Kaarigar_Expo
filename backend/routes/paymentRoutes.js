const express = require("express");

const {
  createPaymentOrder,
  verifyPayment,
  reconcileMyPayments,
  renderCashfreeCheckout,
  cashfreeReturn,
  getMyPaymentHistory,
} = require("../controllers/paymentController");

const {
  authMiddleware,
} = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================================================
   CREATE PAYMENT ORDER
========================================================= */

router.post(
  "/create-order",
  authMiddleware,
  createPaymentOrder
);

/* =========================================================
   VERIFY PAYMENT
========================================================= */

router.post(
  "/verify",
  authMiddleware,
  verifyPayment
);

/* =========================================================
   RECONCILE OLD PENDING PAYMENTS
========================================================= */

router.post(
  "/reconcile",
  authMiddleware,
  reconcileMyPayments
);

/* =========================================================
   CASHFREE CHECKOUT PAGE
========================================================= */

router.get(
  "/checkout",
  renderCashfreeCheckout
);

/* =========================================================
   CASHFREE RETURN URL
========================================================= */

router.get(
  "/cashfree-return",
  cashfreeReturn
);

/* =========================================================
   PAYMENT HISTORY
========================================================= */

router.get(
  "/my-history",
  authMiddleware,
  getMyPaymentHistory
);

module.exports = router;