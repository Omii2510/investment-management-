
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
};

// USER REGISTRATION
exports.registerUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      mobileNumber,
      password,
      referralCode
    } = req.body;

    if (!fullName || !email || !mobileNumber || !password || !referralCode) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address"
      });
    }

    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase().trim() },
        { mobileNumber: mobileNumber.trim() }
      ]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email or mobile number already registered"
      });
    }

    // Verify referral code
    const referrer = await User.findOne({
      referralCode: referralCode.toUpperCase().trim(),
      accountStatus: "Active"
    });

    if (!referrer) {
      return res.status(400).json({
        success: false,
        message: "Invalid referral code"
      });
    }

    // Generate unique referral code
    const newReferralCode =
      "USR" + require("crypto").randomBytes(6).toString("hex").toUpperCase();

    // Password is automatically hashed by User model pre-save hook
    const user = await User.create({
      fullName,
      email,
      mobileNumber,
      password,
      referralCode: newReferralCode,
      referredBy: referrer._id
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        referralCode: user.referralCode,
        referredBy: user.referredBy
      }
    });

  } catch (error) {
    console.error("Registration Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email, mobile number or referral code already exists"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error during registration"
    });
  }
};

// USER LOGIN
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Find user and explicitly include password
    const user = await User.findOne({
      email: email.toLowerCase().trim()
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Check account status
    if (user.accountStatus !== "Active") {
      return res.status(403).json({
        success: false,
        message: "Your account is not active"
      });
    }

    // Compare password with bcrypt hash
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Generate JWT
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        referralCode: user.referralCode,
        walletBalance: user.walletBalance
      }
    });

  } catch (error) {
    console.error("Login Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error during login"
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        walletBalance: user.walletBalance,
        totalROIEarned: user.totalROIEarned,
        totalLevelIncomeEarned: user.totalLevelIncomeEarned,
        accountStatus: user.accountStatus,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error("Get Profile Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching profile"
    });
  }
};

exports.getMe = getMe;
