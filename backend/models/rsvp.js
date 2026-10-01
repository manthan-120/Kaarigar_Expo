const mongoose = require("mongoose");

const rsvpSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    visitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["REGISTERED", "CANCELLED"],
      default: "REGISTERED",
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "REFUNDED"],
      default: "PENDING",
    },

     ticketNumber: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent the same visitor from registering for the same event twice
rsvpSchema.index(
  { event: 1, visitor: 1 },
  { unique: true }
);

module.exports = mongoose.model("RSVP", rsvpSchema);