const { check } = require("express-validator");
const validatorMiddleWare = require("../../middleware/validatorMiddleWare");
const Review = require("../../models/reviewModel");

exports.getReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Review ID format")
    .notEmpty()
    .withMessage("Review ID is required"),
  validatorMiddleWare,
];

exports.createReviewValidator = [
  check("content").optional(),
  check("rating")
    .notEmpty()
    .withMessage("Rating is required")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  check("user")
    .isMongoId()
    .withMessage("Invalid User ID format")
    .notEmpty()
    .withMessage("User ID is required"),
  check("product")
    .isMongoId()
    .withMessage("Invalid Product ID format")
    .notEmpty()
    .withMessage("Product ID is required")
    .custom(async (val, { req }) => {
      // check if loged user craete review before
      const review = await Review.findOne({
        user: req.user._id,
        product: req.body.product,
      });
      if (review) {
        throw new Error("You already created a review before");
      }
    }),
  validatorMiddleWare,
];

exports.updateReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Review ID format")
    .custom(async (val, { req }) => {
      const review = await Review.findById(val);
      if (!review) {
        throw new Error(`Review not found with this id ${val}`);
      }
      if (review.user._id.toString() !== req.user._id.toString()) {
        throw new Error("You are not authorized to update this review");
      }
    }),
  validatorMiddleWare,
];

exports.deleteReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Review ID format")
    .custom(async (val, { req }) => {
      if (req.user.role === "user") {
        const review = await Review.findById(val);
        if (!review) {
          throw new Error(`Review not found with this id ${val}`);
        }
        if (review.user._id.toString() !== req.user._id.toString()) {
          throw new Error("You are not authorized to delete this review");
        }
      }
    }),
  validatorMiddleWare,
];
