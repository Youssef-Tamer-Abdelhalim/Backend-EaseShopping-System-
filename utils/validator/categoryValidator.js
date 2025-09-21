const slugify = require("slugify");
const { check, body } = require("express-validator");
const validatorMiddleWare = require("../../middleware/validatorMiddleWare");

exports.getCategoryValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid category ID format")
    .notEmpty()
    .withMessage("Category ID is required"),
  validatorMiddleWare,
];

exports.createCategoryValidator = [
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

exports.updateCategoryValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid category ID format")
    .notEmpty()
    .withMessage("Category ID is required"),
  body("name")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleWare,
];

exports.deleteCategoryValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid category ID format")
    .notEmpty()
    .withMessage("Category ID is required"),
  validatorMiddleWare,
];
