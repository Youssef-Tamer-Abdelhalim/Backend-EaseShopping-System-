const Review = require("../models/reviewModel");
const factory = require("./handlersFactroy");

// Nested route (create)
// api/v1/products/:productId/reviews
// Middleware to set productId in request body
exports.setProductIdAndUserIdToBody = (req, res, next) => {
  if (!req.body.product) {
    req.body.product = req.params.productId;
  }
  if (!req.body.user) {
    req.body.user = req.user.id;
  }
  next();
};

// Nested route (get)
// api/v1/products/:productId/reviews
// Middleware to create filter object
exports.createFilterOBJ = (req, res, next) => {
  let filterObject = {};
  if (req.params.productId) {
    filterObject = { product: req.params.productId };
  }
  req.filterOBJ = filterObject;
  next();
};

// @desc    Get list of reviews
// @route   GET /api/v1/reviews
// @access  Public
exports.getReviews = factory.getAll(Review);

// @desc    Get specific review by id
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReview = factory.getOne(Review);

// @desc    Create a new review
// @route   POST /api/v1/reviews
// @access  Private,protected=user
exports.createReview = factory.createOne(Review);

// @desc    Update a specific review
// @route   PUT /api/v1/reviews/:id
// @access  Private,protected=user
exports.updateReview = factory.updateOne(Review);

// @desc    Delete a specific review
// @route   DELETE /api/v1/reviews/:id
// @access  Private,protected={user, manger, admin}
exports.deleteReview = factory.deleteOne(Review);
