
const User = require("../models/User");
const Investment = require("../models/Investment");

// GET USER DASHBOARD
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch user's financial summary
    const user = await User.findById(userId)
      .select("walletBalance totalROIEarned totalLevelIncomeEarned")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Calculate total invested amount and investment count
    const investmentSummary = await Investment.aggregate([
      {
        $match: {
          user: userId
        }
      },
      {
        $group: {
          _id: null,
          totalInvestments: {
            $sum: "$investmentAmount"
          },
          investmentCount: {
            $sum: 1
          }
        }
      }
    ]);

    const summary = investmentSummary[0] || {
      totalInvestments: 0,
      investmentCount: 0
    };

    return res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",
      data: {
        totalInvestments: summary.totalInvestments,
        investmentCount: summary.investmentCount,
        totalROIEarned: user.totalROIEarned || 0,
        totalLevelIncomeEarned: user.totalLevelIncomeEarned || 0,
        walletBalance: user.walletBalance || 0
      }
    });

  } catch (error) {
    console.error("Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard"
    });
  }
};
