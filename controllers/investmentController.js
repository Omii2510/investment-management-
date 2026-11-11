
const mongoose = require("mongoose");
const Investment = require("../models/Investment");
const User = require("../models/User");
const ROIHistory = require("../models/ROIHistory");
const investmentPlans = require("../config/investmentPlans");
const distributeReferralCommissions = require("../utils/referralCommissions");

// 1. CREATE INVESTMENT
exports.createInvestment = async (req, res) => {
  try {
    const { planCode, investmentAmount } = req.body;

    if (!planCode || investmentAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Plan code and investment amount are required"
      });
    }

    const amount = Number(investmentAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Investment amount must be a positive number"
      });
    }

    // Find an approved, enabled plan
    const selectedPlan = investmentPlans.find(
      plan =>
        plan.planCode === planCode &&
        plan.enabled === true
    );

    if (!selectedPlan) {
      return res.status(400).json({
        success: false,
        message: "Invalid or unavailable investment plan"
      });
    }

    if (
      amount < selectedPlan.minAmount ||
      amount > selectedPlan.maxAmount
    ) {
      return res.status(400).json({
        success: false,
        message: `Investment amount must be between ${selectedPlan.minAmount} and ${selectedPlan.maxAmount}`
      });
    }

    const startDate = new Date();

    const endDate = new Date(startDate);
    endDate.setUTCDate(
      endDate.getUTCDate() + selectedPlan.durationDays
    );

    // Store the selected plan details from server configuration
    const investment = await Investment.create({
      user: req.user._id,
      investmentAmount: amount,
      planDetails: {
        planName: selectedPlan.planName,
        durationDays: selectedPlan.durationDays,
        description: selectedPlan.description || ""
      },
      startDate,
      endDate,
      dailyROIPercentage: selectedPlan.dailyROIPercentage,
      investmentStatus: "Active"
    });

    return res.status(201).json({
      success: true,
      message: "Investment created successfully",
      data: investment
    });

  } catch (error) {
    console.error("Create Investment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating investment"
    });
  }
}; 


// 2. DISTRIBUTE DAILY ROI FOR AN INVESTMENT
// POST /api/investments/:id/distribute-roi
exports.distributeROI = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid investment ID" });
    }

    const investment = await Investment.findOne({
      _id: id,
      user: req.user._id,
      investmentStatus: "Active"
    });

    if (!investment) {
      return res.status(404).json({ success: false, message: "Active investment not found" });
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Prevent duplicate ROI for the same day
    const alreadyCredited = await ROIHistory.findOne({
      investment: investment._id,
      date: today
    });

    if (alreadyCredited) {
      return res.status(409).json({ success: false, message: "ROI already distributed for today" });
    }

    const roiAmount = parseFloat(
      ((investment.investmentAmount * investment.dailyROIPercentage) / 100).toFixed(2)
    );

    // Credit ROI to the investor
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        walletBalance: roiAmount,
        totalROIEarned: roiAmount
      }
    });

    // Record ROI history
    await ROIHistory.create({
      user: req.user._id,
      investment: investment._id,
      roiAmount,
      date: today,
      status: "Credited"
    });

    // Mark investment completed if end date reached
    if (new Date() >= investment.endDate) {
      investment.investmentStatus = "Completed";
      await investment.save();
    }

    // Distribute referral commissions up to 3 levels (paid by company)
    await distributeReferralCommissions(req.user._id, roiAmount, investment._id);

    return res.status(200).json({
      success: true,
      message: "ROI distributed and referral commissions paid successfully",
      data: { roiAmount }
    });

  } catch (error) {
    console.error("Distribute ROI Error:", error);
    return res.status(500).json({ success: false, message: "Server error while distributing ROI" });
  }
};


// 3. GET ALL USER INVESTMENTS
exports.getUserInvestments = async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 10)
    );

    const skip = (page - 1) * limit;

    const filter = { user: req.user._id };

    const [investments, total] = await Promise.all([
      Investment.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Investment.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      message: "Investments fetched successfully",
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: investments
    });

  } catch (error) {
    console.error("Get Investments Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching investments"
    });
  }
};


// 4. GET INVESTMENT BY ID
exports.getInvestmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid investment ID"
      });
    }

    // Only return an investment belonging to the logged-in user
    const investment = await Investment.findOne({
      _id: id,
      user: req.user._id
    }).lean();

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: "Investment not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Investment details fetched successfully",
      data: investment
    });

  } catch (error) {
    console.error("Get Investment Details Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching investment details"
    });
  }
};


