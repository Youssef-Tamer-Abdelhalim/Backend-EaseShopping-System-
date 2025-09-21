const { check, body } = require("express-validator");
const validatorMiddleWare = require("../../middleware/validatorMiddleWare");
const Coupon = require("../../models/couponModel");

exports.createCouponValidator = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3, max: 32 })
    .withMessage("Name must be between 3 and 32 characters")
    .custom(async (val) => {
      const coupon = await Coupon.findOne({ name: val });
      if (coupon) {
        return Promise.reject(new Error("Coupon already exists"));
      }
    }),
  body("discountDegree")
    .notEmpty()
    .withMessage("Discount Degree is required")
    .isFloat({ min: 1, max: 100 })
    .withMessage("Discount Degree must be between 1 and 100"),
  body("discountMAX")
    .notEmpty()
    .withMessage("Maximum discount is required")
    .isFloat({ min: 1 })
    .withMessage("Maximum discount must be positive"),
  body("expiryDate")
    .notEmpty()
    .withMessage("Expiry date is required")
    .isAfter(new Date().toISOString())
    .withMessage("Expiry date must be in the future"),
  validatorMiddleWare,
];

exports.getCouponValidator = [
  check("id").isMongoId().withMessage("Invalid Coupon id format"),
  validatorMiddleWare,
];

exports.updateCouponValidator = [
  check("id").isMongoId().withMessage("Invalid Coupon id format"),
  body("name")
    .optional()
    .isLength({ min: 3, max: 32 })
    .withMessage("Name must be between 3 and 32 characters")
    .custom(async (val) => {
      const coupon = await Coupon.findOne({ name: val });
      if (coupon) {
        return Promise.reject(new Error("Coupon already exists"));
      }
    }),
  body("discountDegree")
    .optional()
    .isFloat({ min: 1, max: 100 })
    .withMessage("Discount Degree must be between 1 and 100"),
  body("discountMAX")
    .optional()
    .isFloat({ min: 1 })
    .withMessage("Maximum discount must be positive"),
  body("expiryDate")
    .optional()
    .isAfter(new Date().toISOString())
    .withMessage("Expiry date must be in the future"),
  validatorMiddleWare,
];

exports.deleteCouponValidator = [
  check("id").isMongoId().withMessage("Invalid Coupon id format"),
  validatorMiddleWare,
];
