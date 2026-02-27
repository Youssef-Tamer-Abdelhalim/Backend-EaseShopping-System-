const Brand = require("../models/brandModel");
const factory = require("./handlersFactroy");
const { uploadMixOfImages, 
        setCloudinaryUrls
      } = require("../middleware/uploadImageMiddleware");

const imageFields = [
  { name: "image", maxCount: 1 },
];

exports.uploadBrandImage = uploadMixOfImages(imageFields, "brands");
exports.handleCloudinaryImages = setCloudinaryUrls(imageFields);

// @desc    Get list of brands
// @route   GET /api/v1/brands
// @access  Public
exports.getBrands = factory.getAll(Brand);

// @desc    Get specific brand by id
// @route   GET /api/v1/brands/:id
// @access  Public
exports.getBrand = factory.getOne(Brand);

// @desc    Create a new brand
// @route   POST /api/v1/brands
// @access  Private
exports.createBrand = factory.createOne(Brand);

// @desc    Update a specific brand
// @route   PUT /api/v1/brands/:id
// @access  Private
exports.updateBrand = factory.updateOne(Brand);

// @desc    Delete a specific brand
// @route   DELETE /api/v1/brands/:id
// @access  Private
exports.deleteBrand = factory.deleteOne(Brand);
