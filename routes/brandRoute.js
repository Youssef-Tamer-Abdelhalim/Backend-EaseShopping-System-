const express = require("express"); //هنا عملنا require لى express عشان يشتغل

const {
  getBrands,
  createBrand,
  getBrand,
  updateBrand,
  deleteBrand,
  uploadBrandImage,
  handleCloudinaryImages
} = require("../services/brandServices");

const {
  getBrandValidator,
  createBrandValidator,
  updateBrandValidator,
  deleteBrandValidator,
} = require("../utils/validator/brandValidator");

const authServices = require("../services/authServices");
const { cacheResponse, clearCache } = require("../middleware/cacheMiddleware");

const router = express.Router();

router
  .route("/")
  .get(cacheResponse, getBrands)
  .post(
    authServices.protect,
    authServices.allowedTo("manager", "admin"),
    clearCache("/api/v1/brands"),
    uploadBrandImage,
    handleCloudinaryImages,
    createBrandValidator,
    createBrand
  );

router
  .route("/:id")
  .get(cacheResponse, getBrandValidator, getBrand)
  .put(
    authServices.protect,
    authServices.allowedTo("manager", "admin"),
    clearCache("/api/v1/brands"),
    uploadBrandImage,
    handleCloudinaryImages,
    updateBrandValidator,
    updateBrand
  )
  .delete(
    authServices.protect,
    authServices.allowedTo("admin"),
    clearCache("/api/v1/brands"),
    deleteBrandValidator,
    deleteBrand
  );

module.exports = router;
