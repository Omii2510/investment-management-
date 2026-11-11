
const User = require("../models/User");

// GET /api/referrals/direct
// Fetch users directly referred by the logged-in user.
exports.getDirectReferrals = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    const skip = (page - 1) * limit;

    const filter = { referredBy: req.user._id };

    const [referrals, total] = await Promise.all([
      User.find(filter)
        .select("fullName referralCode accountStatus createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      User.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      message: "Direct referrals fetched successfully",
      data: {
        totalReferrals: total,
        referrals,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          limit,
          totalRecords: total
        }
      }
    });
  } catch (error) {
    console.error("Direct Referrals Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching direct referrals"
    });
  }
};


// GET /api/referrals/tree
// Fetch the complete referral hierarchy.
exports.getReferralTree = async (req, res) => {
  try {
    const result = await User.aggregate([
      {
        $match: {
          _id: req.user._id
        }
      },
      {
        $graphLookup: {
          from: User.collection.name,
          startWith: "$_id",
          connectFromField: "_id",
          connectToField: "referredBy",
          as: "referralTree",
          depthField: "depth"
        }
      },
      {
        $project: {
          _id: 0,
          referralTree: {
            _id: 1,
            fullName: 1,
            referralCode: 1,
            accountStatus: 1,
            referredBy: 1,
            createdAt: 1,
            depth: 1
          }
        }
      }
    ]).option({ maxTimeMS: 10000 });

    const users = result[0]?.referralTree || [];

    // Group referred users by referral level.
    const levelMap = {};

    users.forEach((user) => {
      // MongoDB depth starts at 0.
      // Therefore, depth 0 represents Level 1.
      const level = user.depth + 1;

      if (!levelMap[level]) {
        levelMap[level] = [];
      }

      const { depth, ...userDetails } = user;
      levelMap[level].push(userDetails);
    });

    const levels = Object.keys(levelMap)
      .map(Number)
      .sort((a, b) => a - b)
      .map((level) => ({
        level,
        totalUsers: levelMap[level].length,
        users: levelMap[level]
      }));

    return res.status(200).json({
      success: true,
      message: "Referral tree fetched successfully",
      data: {
        totalReferrals: users.length,
        totalLevels: levels.length,
        levels
      }
    });
  } catch (error) {
    console.error("Referral Tree Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching referral tree"
    });
  }
};
