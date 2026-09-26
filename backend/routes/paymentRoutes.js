const express = require("express");

const {
  createPaymentOrder,
  verifyPayment,
  renderCashfreeCheckout,
  cashfreeReturn,
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

module.exports = router;