const express = require("express"); 

const {
  getProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  uploadProductsImage,
  handleCloudinaryImages,
} = require("../services/productServices");

const {
  getProductValidator,
  createProductValidator,
  updateProductValidator,
  deleteProductValidator,
} = require("../utils/validator/productValidator");

const reviewsRoute = require("./reviewRoute");

const authServices = require("../services/authServices");

const router = express.Router();

router.use("/:productId/reviews", reviewsRoute);

router
  .route("/")
  .get(getProducts)
  .post(
    authServices.protect,
    authServices.allowedTo("manager", "admin"),
    uploadProductsImage,
    handleCloudinaryImages,
    createProductValidator,
    createProduct
  );

router
  .route("/:id")
  .get(getProductValidator, getProduct)
  .put(
    authServices.protect,
    authServices.allowedTo("manager", "admin"),
    uploadProductsImage,
    handleCloudinaryImages,
    updateProductValidator,
    updateProduct
  )
  .delete(
    authServices.protect,
    authServices.allowedTo("admin"),
    deleteProductValidator,
    deleteProduct
  );

module.exports = router;
