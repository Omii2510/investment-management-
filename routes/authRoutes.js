
const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getMe
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimitMiddleware");

const { validateRequest } = require("../middleware/validationMiddleware");

const {
  registerValidator,
  loginValidator
} = require("../validators/authValidators");

// Registration
router.post(
  "/register",
  authLimiter,
  registerValidator,
  validateRequest,
  registerUser
);

// Login
router.post(
  "/login",
  authLimiter,
  loginValidator,
  validateRequest,
  loginUser
);

// Protected user profile
router.get("/me", protect, getMe);

module.exports = router;
