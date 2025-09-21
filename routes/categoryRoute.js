const express = require("express"); //هنا عملنا require لى express عشان يشتغل

const {
  getCategories,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
  resizeImage,
} = require("../services/categoryServices");

const {
  getCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
} = require("../utils/validator/categoryValidator");

const authServices = require("../services/authServices");

const router = express.Router();

const subCategoryRoutes = require("./subCategoryRoute");

router
  .route("/")
  .get(getCategories)
  .post(
    authServices.protect,
    authServices.allowedTo("manager", "admin"),
    uploadCategoryImage,
    resizeImage,
    createCategoryValidator,
    createCategory
  );

router.use("/:categoryId/subcategories", subCategoryRoutes);

router
  .route("/:id")
  .get(getCategoryValidator, getCategory)
  .put(
    authServices.protect,
    authServices.allowedTo("manager", "admin"),
    uploadCategoryImage,
    resizeImage,
    updateCategoryValidator,
    updateCategory
  )
  .delete(authServices.protect,
    authServices.allowedTo("admin"),deleteCategoryValidator, deleteCategory);

module.exports = router;
