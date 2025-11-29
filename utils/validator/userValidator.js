const bcrypt = require("bcryptjs");
const slugify = require("slugify");
const { check, body } = require("express-validator");
const validatorMiddleWare = require("../../middleware/validatorMiddleWare");
const User = require("../../models/userModel");

// for Admin User only
exports.createUserValidator = [
  check("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3, max: 32 })
    .withMessage("Name must be between 3 and 32 characters")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("Email already in use"));
        }
      })
    ),

  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .custom((password, { req }) => {
      if (password !== req.body.confirmPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

  check("confirmPassword")
    .notEmpty()
    .withMessage("Confirm Password is required"),

  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number format")
    .custom((val) =>
      User.findOne({ phone: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("Phone number already in use"));
        }
      })
    ),

  check("profileImg").optional(),

  check("role").optional(),

  validatorMiddleWare,
];

exports.getUserValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid user ID format")
    .notEmpty()
    .withMessage("User ID is required"),
  validatorMiddleWare,
];

exports.updateUserValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid user ID format")
    .notEmpty()
    .withMessage("User ID is required"),
  body("name")
    .optional()
    .isLength({ min: 3, max: 32 })
    .withMessage("Name must be between 3 and 32 characters")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (val, { req }) => {
      // Check if email is used by another user (exclude current user being updated)
      const user = await User.findOne({
        email: val,
        _id: { $ne: req.params.id },
      });
      if (user) {
        return Promise.reject(new Error("Email already in use"));
      }
      return true;
    }),

  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number format")
    .custom(async (val, { req }) => {
      // Check if phone is used by another user (exclude current user being updated)
      const user = await User.findOne({
        phone: val,
        _id: { $ne: req.params.id },
      });
      if (user) {
        return Promise.reject(new Error("Phone number already in use"));
      }
      return true;
    }),

  check("profileImg").optional(),

  check("role").optional(),

  validatorMiddleWare,
];

exports.changeUserPasswordValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid user ID format")
    .notEmpty()
    .withMessage("User ID is required"),
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .custom(async (password, { req }) => {
      const user = await User.findById(req.params.id).select("password");
      if (!user) {
        throw new Error("User not found for this ID");
      }

      const isPasswordMatch = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!isPasswordMatch) {
        throw new Error("Current password is incorrect");
      }

      if (password !== req.body.confirmPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  validatorMiddleWare,
];

exports.deleteUserValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid user ID format")
    .notEmpty()
    .withMessage("User ID is required"),
  validatorMiddleWare,
];

// for basic user
exports.changeLoggedUserPasswordValidator = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .custom(async (password, { req }) => {
      const user = await User.findById(req.user._id).select("password");
      if (!user) {
        throw new Error("User not found for this ID");
      }

      const isPasswordMatch = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!isPasswordMatch) {
        throw new Error("Current password is incorrect");
      }

      if (password !== req.body.confirmPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  validatorMiddleWare,
];

exports.updateLoggedUserValidator = [
  body("name")
    .optional()
    .isLength({ min: 3, max: 32 })
    .withMessage("Name must be between 3 and 32 characters")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (val, { req }) => {
      // If email is the same as current user's email, skip validation
      if (val === req.user.email) {
        return true;
      }
      // Check if email is used by another user
      const user = await User.findOne({ email: val });
      if (user) {
        return Promise.reject(new Error("Email already in use"));
      }
      return true;
    }),

  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number format")
    .custom(async (val, { req }) => {
      // If phone is the same as current user's phone, skip validation
      if (val === req.user.phone) {
        return true;
      }
      // Check if phone is used by another user
      const user = await User.findOne({ phone: val });
      if (user) {
        return Promise.reject(new Error("Phone number already in use"));
      }
      return true;
    }),

  validatorMiddleWare,
];
