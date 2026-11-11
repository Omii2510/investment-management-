
const User = require("../models/User");
const ReferralIncome = require("../models/ReferralIncome");

// Commission rates per level (Level 1 = direct parent)
const LEVEL_RATES = { 1: 0.05, 2: 0.03, 3: 0.02 };

/**
 * Distributes referral commissions up to 3 ancestor levels.
 * Commission is paid from the Company account — NOT deducted from earner's ROI.
 *
 * @param {ObjectId} earnerId  - User who earned the ROI
 * @param {number}   roiAmount - The ROI amount that was credited to the earner
 * @param {ObjectId} investmentId - The investment that generated the ROI (for reference)
 */
async function distributeReferralCommissions(earnerId, roiAmount, investmentId) {
  let currentUserId = earnerId;

  for (let level = 1; level <= 3; level++) {
    // Fetch the current user to find their referrer
    const currentUser = await User.findById(currentUserId).select("referredBy").lean();

    if (!currentUser || !currentUser.referredBy) break; // No more ancestors

    const ancestorId = currentUser.referredBy;
    const commissionAmount = parseFloat((roiAmount * LEVEL_RATES[level]).toFixed(2));

    // Credit ancestor's wallet and totalLevelIncomeEarned (company pays — no ROI deduction)
    await User.findByIdAndUpdate(ancestorId, {
      $inc: {
        walletBalance: commissionAmount,
        totalLevelIncomeEarned: commissionAmount
      }
    });

    // Record the referral income transaction
    await ReferralIncome.create({
      receiver: ancestorId,
      generatedBy: earnerId,
      referralLevel: level,
      incomeAmount: commissionAmount,
      date: new Date()
    });

    // Move one level up for the next iteration
    currentUserId = ancestorId;
  }
}

module.exports = distributeReferralCommissions;
