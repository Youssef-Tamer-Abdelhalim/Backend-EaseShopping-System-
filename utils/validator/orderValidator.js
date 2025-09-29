const { check, body } = require("express-validator");
const validatorMiddleWare = require("../../middleware/validatorMiddleWare");
const Cart = require("../../models/cartModel");

exports.createCashOrderValidator = [
  check("cartId")
    .notEmpty()
    .withMessage("cartId is required")
    .isMongoId()
    .withMessage("Invalid cartId format")
    .custom(async (val, { req }) => {
      const cart = await Cart.findById(val);
      if (!cart) {
        return Promise.reject(new Error("Cart not found"));
      }
    }),
  body("shippingAddress.details")
    .notEmpty()
    .withMessage("shippingAddress.details is required"),
  body("shippingAddress.phone")
    .notEmpty()
    .withMessage("shippingAddress.phone is required"),
  body("shippingAddress.city")
    .notEmpty()
    .withMessage("shippingAddress.city is required"),
  body("shippingAddress.postalCode")
    .notEmpty()
    .withMessage("shippingAddress.postalCode is required"),
  body("shippingAddress.country")
    .notEmpty()
    .withMessage("shippingAddress.country is required"),
  validatorMiddleWare,
];

exports.createOnlineOrderValidator = [
  check("cartId")
    .notEmpty()
    .withMessage("cartId is required")
    .isMongoId()
    .withMessage("Invalid cartId format")
    .custom(async (val, { req }) => {
      const cart = await Cart.findById(val);
      if (!cart) {
        return Promise.reject(new Error("Cart not found"));
      }
    }),
  body("shippingAddress.details")
    .notEmpty()
    .withMessage("shippingAddress.details is required"),
  body("shippingAddress.phone")
    .notEmpty()
    .withMessage("shippingAddress.phone is required"),
  body("shippingAddress.city")
    .notEmpty()
    .withMessage("shippingAddress.city is required"),
  body("shippingAddress.postalCode")
    .notEmpty()
    .withMessage("shippingAddress.postalCode is required"),
  body("shippingAddress.country")
    .notEmpty()
    .withMessage("shippingAddress.country is required"),
  body("paymentMethod").notEmpty().withMessage("Payment method is required"),
  validatorMiddleWare,
];
