const { check, body } = require("express-validator");
const validatorMiddleWare = require("../../middleware/validatorMiddleWare");

exports.addToWishlistValidator = [
  body("productId")
    .notEmpty()
    .withMessage("productId is required")
    .isMongoId()
    .withMessage("Invalid productId format"),
  validatorMiddleWare,
];

exports.removeFromWishlistValidator = [
  check("productId")
    .notEmpty()
    .withMessage("productId is required")
    .isMongoId()
    .withMessage("Invalid productId format"),
  validatorMiddleWare,
];
