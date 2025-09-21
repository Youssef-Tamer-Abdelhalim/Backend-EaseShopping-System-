const slugify = require("slugify");
const { check, body } = require("express-validator");
const validatorMiddleWare = require("../../middleware/validatorMiddleWare");

exports.getBrandValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid brand ID format")
    .notEmpty()
    .withMessage("Brand ID is required"),
  validatorMiddleWare,
];

exports.createBrandValidator = [
  check("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3, max: 32 })
    .withMessage("Name must be between 3 and 32 characters")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleWare,
];

exports.updateBrandValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid brand ID format")
    .notEmpty()
    .withMessage("Brand ID is required"),
  body("name")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleWare,
];

exports.deleteBrandValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid brand ID format")
    .notEmpty()
    .withMessage("Brand ID is required"),
  validatorMiddleWare,
];
