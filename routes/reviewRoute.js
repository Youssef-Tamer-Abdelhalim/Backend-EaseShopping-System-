const express = require("express"); //هنا عملنا require لى express عشان يشتغل

const {
  getReviews,
  createReview,
  getReview,
  updateReview,
  deleteReview,
  createFilterOBJ,
  setProductIdAndUserIdToBody,
} = require("../services/reviewServices");

const {
  getReviewValidator,
  createReviewValidator,
  updateReviewValidator,
  deleteReviewValidator,
} = require("../utils/validator/reviewValidator");

const authServices = require("../services/authServices");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(createFilterOBJ, getReviews)
  .post(
    authServices.protect,
    authServices.allowedTo("user"),
    setProductIdAndUserIdToBody,
    createReviewValidator,
    createReview
  );

router
  .route("/:id")
  .get(
    getReviewValidator, 
    getReview)
  .put(
    authServices.protect,
    authServices.allowedTo("user"),
    updateReviewValidator,
    updateReview
  )
  .delete(
    authServices.protect,
    authServices.allowedTo("admin", "manager", "user"),
    deleteReviewValidator,
    deleteReview
  );

module.exports = router;
