
const express = require("express");
const router = express.Router();

const {
  getPlans,
  createInvestment,
  distributeROI,
  getROIHistory,
  getUserInvestments,
  getInvestmentById
} = require("../controllers/investmentController");

const { protect } = require("../middleware/authMiddleware");

// Public - get available plans
router.get("/plans", getPlans);

// All investment routes require JWT authentication

// Create investment
router.post("/", protect, createInvestment);

// Get all investments of logged-in user
router.get("/", protect, getUserInvestments);

// Distribute daily ROI and trigger referral commissions
router.post("/:id/distribute-roi", protect, distributeROI);

// Get ROI history for an investment
router.get("/:id/roi-history", protect, getROIHistory);

// Get investment by ID
router.get("/:id", protect, getInvestmentById);

module.exports = router;
