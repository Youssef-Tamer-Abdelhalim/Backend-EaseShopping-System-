const factory = require("./handlersFactroy");
const Category = require("../models/categoryModel");
const { uploadMixOfImages, 
        setCloudinaryUrls
      } = require("../middleware/uploadImageMiddleware");

const imageFields = [
  { name: "image", maxCount: 1 },
];

exports.uploadCategoryImage = uploadMixOfImages(imageFields, "categories");
exports.handleCloudinaryImages = setCloudinaryUrls(imageFields);     

// @desc    Get list of categories
// @route   GET /api/v1/categories
// @access  Public
exports.getCategories = factory.getAll(Category);

// @desc    Get specific category by id
// @route   GET /api/v1/categories/:id
// @access  Public
exports.getCategory = factory.getOne(Category);

// @desc    Create a new category
// @route   POST /api/v1/categories
// @access  Private
exports.createCategory = factory.createOne(Category);

// @desc    Update a specific category
// @route   PUT /api/v1/categories/:id
// @access  Private
exports.updateCategory = factory.updateOne(Category);

// @desc    Delete a specific category
// @route   DELETE /api/v1/categories/:id
// @access  Private
exports.deleteCategory = factory.deleteOne(Category);
