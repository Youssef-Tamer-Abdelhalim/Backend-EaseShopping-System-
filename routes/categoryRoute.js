const express = require("express"); //هنا عملنا require لى express عشان يشتغل

const {
  getCategories,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
  handleCloudinaryImages,
} = require("../services/categoryServices");

const {
  getCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
} = require("../utils/validator/categoryValidator");

const authServices = require("../services/authServices");
const { cacheResponse, clearCache } = require("../middleware/cacheMiddleware");

const router = express.Router();

const subCategoryRoutes = require("./subCategoryRoute");

router
  .route("/")
  .get(cacheResponse, getCategories)
  .post(
    authServices.protect,
    authServices.allowedTo("manager", "admin"),
    clearCache("/api/v1/categories"),
    uploadCategoryImage,
    handleCloudinaryImages,
    createCategoryValidator,
    createCategory
  );

router.use("/:categoryId/subcategories", subCategoryRoutes);

router
  .route("/:id")
  .get(cacheResponse, getCategoryValidator, getCategory)
  .put(
    authServices.protect,
    authServices.allowedTo("manager", "admin"),
    clearCache("/api/v1/categories"),
    uploadCategoryImage,
    handleCloudinaryImages,
    updateCategoryValidator,
    updateCategory
  )
  .delete(
    authServices.protect,
    authServices.allowedTo("admin"),
    clearCache("/api/v1/categories"),
    deleteCategoryValidator,
    deleteCategory
  );

module.exports = router;
