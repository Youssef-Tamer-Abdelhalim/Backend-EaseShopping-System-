const express = require("express");

const { addToWishlist, removeFromWishlist, getLoggedUserWishlist } = require("../services/wishlistServices");

const { addToWishlistValidator, removeFromWishlistValidator } = require("../utils/validator/wishlistValidator");

const authServices = require("../services/authServices");

const router = express.Router();

router.use(authServices.protect, authServices.allowedTo("user"))

router
  .route("/")
  .post(addToWishlistValidator, addToWishlist)
  .get(getLoggedUserWishlist);

router
  .route("/:productId")
  .delete(removeFromWishlistValidator, removeFromWishlist);

module.exports = router;