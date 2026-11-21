require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const User = require("../models/User");

  const existing = await User.findOne({ email: "admin@invest.com" });
  if (existing) {
    console.log("Seed user already exists!");
    console.log("Email:    admin@invest.com");
    console.log("Password: Admin@1234");
    console.log("Referral Code:", existing.referralCode);
    await mongoose.disconnect();
    return;
  }

  const password = await bcrypt.hash("Admin@1234", 12);
  const referralCode = "USR" + crypto.randomBytes(6).toString("hex").toUpperCase();

  const user = await User.create({
    fullName: "Admin User",
    email: "admin@invest.com",
    mobileNumber: "9999999999",
    password,
    referralCode,
    referredBy: null,
    accountStatus: "Active",
  });

  console.log("✅ Seed user created!");
  console.log("Email:         admin@invest.com");
  console.log("Password:      Admin@1234");
  console.log("Referral Code:", user.referralCode);
  console.log("\nShare this referral code with new users to register.");

  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
