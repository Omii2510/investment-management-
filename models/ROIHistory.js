
const mongoose = require("mongoose");

const roiHistorySchema = new mongoose.Schema(
  {
    // User who receives the ROI
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Investment that generated the ROI
    investment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Investment",
      required: true
    },

    roiAmount: {
      type: Number,
      required: true,
      min: 0
    },

    date: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ["Pending", "Credited", "Failed"],
      default: "Pending"
    }
  },
  {
    timestamps: true
  }
);

// Indexes for faster ROI history queries
roiHistorySchema.index({ user: 1, date: -1 });
roiHistorySchema.index({ investment: 1, date: -1 });

// Prevent duplicate daily ROI entries for one investment
roiHistorySchema.index(
  { investment: 1, date: 1 },
  { unique: true }
);

const ROIHistory = mongoose.model(
  "ROIHistory",
  roiHistorySchema
);

module.exports = ROIHistory;
