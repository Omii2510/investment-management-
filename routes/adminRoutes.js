const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { runDailyROIJob } = require("../jobs/dailyROIJob");

// POST /api/admin/run-roi-job
router.post("/run-roi-job", protect, async (req, res) => {
  try {
    await runDailyROIJob();
    return res.status(200).json({ success: true, message: "ROI job executed successfully" });
  } catch (err) {
    console.error("[Admin] ROI job error:", err.message);
    return res.status(500).json({ success: false, message: "ROI job failed", error: err.message });
  }
});

module.exports = router;
  