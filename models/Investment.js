
const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema(
  {
    // Reference to the user who made the investment
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    investmentAmount: {
      type: Number,
      required: true,
      min: 0.01
    },

    // Details of the selected investment plan
    planDetails: {
      planName: {
        type: String,
        required: true,
        trim: true
      },

      durationDays: {
        type: Number,
        required: true,
        min: 1
      },

      description: {
        type: String,
        default: ""
      }
    },

    startDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date,
      required: true
    },

    dailyROIPercentage: {
      type: Number,
      required: true,
      min: 0
    },

    investmentStatus: {
      type: String,
      enum: ["Active", "Completed", "Cancelled"],
      default: "Active"
    }
  },
  {
    timestamps: true
  }
);

// Indexes for faster queries
investmentSchema.index({ user: 1, investmentStatus: 1 });
investmentSchema.index({ endDate: 1 });

const Investment = mongoose.model(
  "Investment",
  investmentSchema
);

module.exports = Investment;
