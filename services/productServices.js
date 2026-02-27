const Product = require("../models/productModel");
const factory = require("./handlersFactroy");
const { uploadMixOfImages, 
        setCloudinaryUrls 
      } = require("../middleware/uploadImageMiddleware");

const imageFields = [
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 5 },
];

exports.uploadProductsImage = uploadMixOfImages(imageFields, "products");
exports.handleCloudinaryImages = setCloudinaryUrls(imageFields);

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