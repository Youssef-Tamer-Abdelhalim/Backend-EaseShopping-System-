const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const factory = require("./handlersFactroy");
const { uploadMixOfImages } = require("../middleware/uploadImageMiddleware");

exports.uploadProductsImage = uploadMixOfImages(
  [
    { name: "imageCover", maxCount: 1 },
    { name: "images", maxCount: 2 },
  ],
  "products"
);

exports.handleCloudinaryImages = asyncHandler(async (req, res, next) => {

  if (req.files && req.files.imageCover) {
    req.body.imageCover = req.files.imageCover[0].path;
  }

  if (req.files && req.files.images) {
    req.body.images = req.files.images.map((img) => img.path);
  } else {
    req.body.images = []; 
  }
  
  next();
});

// @desc    Get list of products
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = factory.getAll(Product, "Products");

// @desc    Get one of products
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = factory.getOne(Product, "reviews");

// @desc    Create a new product
// @route   POST /api/v1/products
// @access  Private
exports.createProduct = factory.createOne(Product);

// @desc    Update a specific product
// @route   PUT /api/v1/products/:id
// @access  Private
exports.updateProduct = factory.updateOne(Product);

// @desc    Delete a specific product
// @route   DELETE /api/v1/products/:id
// @access  Private
exports.deleteProduct = factory.deleteOne(Product);