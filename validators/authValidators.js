
const { body } = require("express-validator");

const registerValidator = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be between 2 and 100 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Enter a valid email address")
    .normalizeEmail(),

  body("mobileNumber")
    .trim()
    .notEmpty()
    .withMessage("Mobile number is required")
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Enter a valid 10-digit Indian mobile number"),

  body("password")
    .isString()
    .withMessage("Password must be a string")
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters"),

  body("referralCode")
    .trim()
    .notEmpty()
    .withMessage("Referral code is required")
    .isLength({ max: 30 })
    .withMessage("Referral code cannot exceed 30 characters")
];

const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Enter a valid email address")
    .normalizeEmail(),

  body("password")
    .isString()
    .withMessage("Password is required")
    .notEmpty()
    .withMessage("Password cannot be empty")
];

module.exports = {
  registerValidator,
  loginValidator
};
