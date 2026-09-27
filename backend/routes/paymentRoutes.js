const express = require("express");

const {
  createPaymentOrder,
  verifyPayment,
  renderCashfreeCheckout,
  cashfreeReturn,
  getMyPaymentHistory,
} = require("../controllers/paymentController");

const {
  authMiddleware,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/create-order",
  authMiddleware,
  createPaymentOrder
);

router.post(
  "/verify",
  authMiddleware,
  verifyPayment
);
router.get(
  "/checkout",
  renderCashfreeCheckout
);

router.get(
  "/cashfree-return",
  cashfreeReturn
);

router.get(
  "/my-history",
  authMiddleware,
  getMyPaymentHistory
);

module.exports = router;