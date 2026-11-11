
const mongoose = require("mongoose");

const referralIncomeSchema = new mongoose.Schema(
  {
    // User who receives the referral income
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // User whose eligible activity generated the income
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Referral level (1 = direct referral, 2 = second level, etc.)
    referralLevel: {
      type: Number,
      required: true,
      min: 1
    },

    incomeAmount: {
      type: Number,
      required: true,
      min: 0.01
    },

    date: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Indexes for faster income history queries
referralIncomeSchema.index({ receiver: 1, date: -1 });
referralIncomeSchema.index({ generatedBy: 1 });
referralIncomeSchema.index({ receiver: 1, referralLevel: 1 });

const ReferralIncome = mongoose.model(
  "ReferralIncome",
  referralIncomeSchema
);

module.exports = ReferralIncome;
