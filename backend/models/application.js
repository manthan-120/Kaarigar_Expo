const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    kaarigar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    craftType: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    photo: {
      type: String,
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    
    paymentStatus: {
      type: String,
      enum: ["UNPAID", "PAID", "REFUNDED"],
      default: "UNPAID",
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

// Prevent the same Kaarigar from applying to the same event twice
applicationSchema.index(
  { event: 1, kaarigar: 1 },
  { unique: true }
);

module.exports = mongoose.model("Application", applicationSchema);