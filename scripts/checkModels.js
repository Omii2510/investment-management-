
require("dotenv").config();

const mongoose = require("mongoose");

// Import all four models
const User = require("../models/User");
const Investment = require("../models/Investment");
const ReferralIncome = require("../models/ReferralIncome");
const ROIHistory = require("../models/ROIHistory");

const checkModels = async () => {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log("MongoDB Connected!");

    // Create collections and indexes
    await Promise.all([
      User.init(),
      Investment.init(),
      ReferralIncome.init(),
      ROIHistory.init()
    ]);

    console.log("All models loaded successfully!");

    console.log("Collections and indexes initialized:");
    console.log("1. User");
    console.log("2. Investment");
    console.log("3. ReferralIncome");
    console.log("4. ROIHistory");

  } catch (error) {
    console.error("Model Verification Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

checkModels();
