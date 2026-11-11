
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    mobileNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      select: false
    },

    referralCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },

    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    walletBalance: {
      type: Number,
      default: 0,
      min: 0
    },

    totalROIEarned: {
      type: Number,
      default: 0,
      min: 0
    },

    totalLevelIncomeEarned: {
      type: Number,
      default: 0,
      min: 0
    },

    accountStatus: {
      type: String,
      enum: ["Active", "Inactive", "Suspended"],
      default: "Active"
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Additional index for referral lookup
userSchema.index({ referredBy: 1 });

const User = mongoose.model("User", userSchema);

module.exports = User;





