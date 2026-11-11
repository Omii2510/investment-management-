
const express = require("express");
const router = express.Router();

const {
  createInvestment,
  distributeROI,
  getUserInvestments,
  getInvestmentById
} = require("../controllers/investmentController");

const { protect } = require("../middleware/authMiddleware");

// All investment routes require JWT authentication

// Create investment
router.post("/", protect, createInvestment);

// Get all investments of logged-in user
router.get("/", protect, getUserInvestments);

// Distribute daily ROI and trigger referral commissions
router.post("/:id/distribute-roi", protect, distributeROI);

// Get investment by ID
router.get("/:id", protect, getInvestmentById);

module.exports = router;
