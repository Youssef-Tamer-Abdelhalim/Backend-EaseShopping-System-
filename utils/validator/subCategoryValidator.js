const slugify = require("slugify");
const { check, body } = require("express-validator");
const validatorMiddleWare = require("../../middleware/validatorMiddleWare");

exports.getSubCategoryValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Sub Category ID format")
    .notEmpty()
    .withMessage("Sub Category ID is required"),
  validatorMiddleWare,
];

exports.createSubCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 1, max: 64 })
    .withMessage("Name must be between 1 and 64 characters")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("category")
    .notEmpty()
    .withMessage("Category is required")
    .isMongoId()
    .withMessage("Invalid Category ID format"),
  validatorMiddleWare,
];

exports.updateSubCategoryValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Sub Category ID format")
    .notEmpty()
    .withMessage("Sub Category ID is required"),
  body("name").custom((val, { req }) => {
    req.body.slug = slugify(val);
    return true;
  }),
  validatorMiddleWare,
];

exports.deleteSubCategoryValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Sub Category ID format")
    .notEmpty()
    .withMessage("Sub Category ID is required"),
  validatorMiddleWare,
];
