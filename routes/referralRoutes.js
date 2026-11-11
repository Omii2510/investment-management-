
const express = require("express");
const router = express.Router();

const {
  getDirectReferrals,
  getReferralTree
} = require("../controllers/referralController");

const { protect } = require("../middleware/authMiddleware");

// Protected referral routes
router.get("/direct", protect, getDirectReferrals);
router.get("/tree", protect, getReferralTree);

module.exports = router;
