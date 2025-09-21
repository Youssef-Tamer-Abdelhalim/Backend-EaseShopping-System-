const SubCategory = require("../models/supCategoryModel");
const factory = require("./handlersFactroy");

// Nested route (create)
// api/v1/categories/:categoryId/subcategories
// Middleware to set categoryId in request body
exports.setCategoryIdInBody = (req, res, next) => {
    if(!req.body.category){
    req.body.category = req.params.categoryId;
  }
  next();
}


// Nested route (get)
// api/v1/categories/:categoryId/subcategories
// Middleware to create filter object
exports.createFilterOBJ = (req, res, next) => {
      let filterObject = {};
  if (req.params.categoryId) {
    filterObject = { category: req.params.categoryId };
  }
  req.filterOBJ = filterObject;
  next();
}


// @desc    Create a new Sub Category
// @route   POST /api/v1/subcategories
// @access  Private
exports.createSubCategory = factory.createOne(SubCategory);

// @desc    Get list of sub categories
// @route   GET /api/v1/subcategories
// @access  Public
exports.getSubCategories = factory.getAll(SubCategory);

// @desc    Get specific subcategory by id
// @route   GET /api/v1/subcategories/:id
// @access  Public
exports.getSubCategory = factory.getOne(SubCategory);

// @desc    Update a specific subcategory
// @route   PUT /api/v1/subcategories/:id
// @access  Private
exports.updateSubCategory = factory.updateOne(SubCategory);

// @desc    Delete a specific subcategory
// @route   DELETE /api/v1/subcategories/:id
// @access  Private
exports.deleteSubCategory = factory.deleteOne(SubCategory);
