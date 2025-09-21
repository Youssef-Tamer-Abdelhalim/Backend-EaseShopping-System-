const express = require("express");
const {
  addProductToCart,
  getMyCart,
  removeProductFromCart,
  clearMyCart,
  editQuantityProductInCart,
  applyCouponOnCart,
  changeCartItemColor,
} = require("../services/cartServices");

const {
  addProductToCartValidator,
  applyCouponOnCartValidator,
  editQuantityProductInCartValidator,
  changeCartItemColorValidator,
  removeProductFromCartValidator
} = require("../utils/validator/cartValidator");

const authServices = require("../services/authServices");

const router = express.Router();

router.use(authServices.protect, authServices.allowedTo("user"));

router
  .route("/")
  .post(addProductToCartValidator, addProductToCart)
  .get(getMyCart)
  .delete(clearMyCart);

router.route("/applyCoupon").patch(applyCouponOnCartValidator, applyCouponOnCart);

router.patch("/:itemId/color", changeCartItemColorValidator, changeCartItemColor);

router
  .route("/:itemId")
  .patch(editQuantityProductInCartValidator, editQuantityProductInCart)
  .delete(removeProductFromCartValidator, removeProductFromCart);

module.exports = router;
