const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
    },

    rsvp: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RSVP",
    },

    purpose: {
      type: String,
      enum: ["VISITOR_RSVP", "KAARIGAR_APPLICATION"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
      required: true,
    },

    cashfreeOrderId: {
      type: String,
      required: true,
      unique: true,
    },

    cashfreePaymentSessionId: {
      type: String,
    },

    cashfreePaymentId: {
      type: String,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "SUCCESS",
        "FAILED",
        "REFUND_REQUESTED",
        "REFUNDED",
      ],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);