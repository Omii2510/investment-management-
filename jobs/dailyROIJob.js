const cron = require("node-cron");
const Investment = require("../models/Investment");
const User = require("../models/User");
const ROIHistory = require("../models/ROIHistory");
const distributeReferralCommissions = require("../utils/referralCommissions");

/**
 * Processes daily ROI for a single active investment.
 * Idempotent: ROIHistory has a unique index on { investment, date },
 * so a duplicate run on the same day will silently skip (code 11000).
 */
async function processInvestmentROI(investment, today) {
  try {
    const roiAmount = parseFloat(
      ((investment.investmentAmount * investment.dailyROIPercentage) / 100).toFixed(2)
    );

    // Insert ROI history — will throw duplicate key error if already processed today
    await ROIHistory.create({
      user: investment.user,
      investment: investment._id,
      roiAmount,
      date: today,
      status: "Credited"
    });

    // Credit ROI to investor wallet
    await User.findByIdAndUpdate(investment.user, {
      $inc: { walletBalance: roiAmount, totalROIEarned: roiAmount }
    });

    // Mark investment completed if end date reached
    if (new Date() >= new Date(investment.endDate)) {
      await Investment.findByIdAndUpdate(investment._id, { investmentStatus: "Completed" });
    }

    // Pay referral commissions up 3 levels (company pays)
    await distributeReferralCommissions(investment.user, roiAmount, investment._id);

    return { status: "credited", investmentId: investment._id, roiAmount };
  } catch (err) {
    // Duplicate key = already processed today, skip silently
    if (err.code === 11000) {
      return { status: "skipped", investmentId: investment._id };
    }
    throw err;
  }
}

/**
 * Main job: fetch all active investments and process ROI.
 */
async function runDailyROIJob() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  console.log(`[ROI Job] Starting — ${today.toISOString()}`);

  const activeInvestments = await Investment.find({
    investmentStatus: "Active",
    startDate: { $lte: new Date() }
  }).lean();

  if (activeInvestments.length === 0) {
    console.log("[ROI Job] No active investments found.");
    return;
  }

  console.log(`[ROI Job] Processing ${activeInvestments.length} investment(s)...`);

  const results = await Promise.allSettled(
    activeInvestments.map((inv) => processInvestmentROI(inv, today))
  );

  let credited = 0, skipped = 0, failed = 0;

  results.forEach((r) => {
    if (r.status === "fulfilled") {
      if (r.value.status === "credited") credited++;
      else skipped++;
    } else {
      failed++;
      console.error("[ROI Job] Failed for investment:", r.reason);
    }
  });

  console.log(`[ROI Job] Done — Credited: ${credited}, Skipped (duplicate): ${skipped}, Failed: ${failed}`);
}

/**
 * Registers the cron schedule: every day at 12:00 AM.
 */
function scheduleDailyROIJob() {
  // Runs at 00:00 every day
  cron.schedule("0 0 * * *", async () => {
    try {
      await runDailyROIJob();
    } catch (err) {
      console.error("[ROI Job] Unexpected error:", err.message);
    }
  }, {
    timezone: "Asia/Kolkata"
  });

  console.log("[ROI Job] Scheduler registered — runs daily at 12:00 AM IST");
}

module.exports = { scheduleDailyROIJob, runDailyROIJob };
