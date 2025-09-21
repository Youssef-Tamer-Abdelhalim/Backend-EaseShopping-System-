const { body, param } = require("express-validator");
const validatorMiddleWare = require("../../middleware/validatorMiddleWare");
const Cart = require("../../models/cartModel");
const Product = require("../../models/productModel");
const Coupon = require("../../models/couponModel");

async function findCartItemContext(req) {
  const userId = req.user && req.user._id;
  const { itemId } = req.params;

  if (itemId) {
    const doc = await Cart.findById(itemId).lean();
    if (doc) {
      const belongs =
        !userId ||
        String(doc.user || doc.userId) === String(userId);
      if (belongs) {
        return {
          mode: "doc",
          itemId,
          userId,
          quantity: doc.quantity,
          productId: doc.productId || doc.product,
          color: doc.color,
        };
      }
    }
  }

  if (userId && itemId) {
    const cart = await Cart.findOne(
      { user: userId, "cartItems._id": itemId },
      { cartItems: { $elemMatch: { _id: itemId } } }
    ).lean();

    const sub = cart && cart.cartItems && cart.cartItems[0];
    if (sub) {
      return {
        mode: "embedded",
        itemId,
        userId,
        quantity: sub.quantity,
        productId: sub.productId || sub.product,
        color: sub.color,
        cartId: cart._id,
      };
    }
  }

  return null;
}

exports.addProductToCartValidator = [
  body("productId")
    .exists({ checkFalsy: true }).withMessage("productId is required")
    .bail()
    .isMongoId().withMessage("Invalid productId")
    .bail()
    .custom(async (id) => {
      const product = await Product.findById(id);
      if (!product) throw new Error("Product not found");
      return true;
    }),
  body("color")
    .optional()
    .custom(async (value, { req }) => {
      const product = await Product.findById(req.body.productId);
      if (!product) throw new Error("Product not found");
      if (!Array.isArray(product.colors) || product.colors.length === 0) {
        throw new Error("This product does not support colors");
      }
      if (!product.colors.includes(value)) {
        throw new Error("Invalid color for this product");
      }
      return true;
    }),
  validatorMiddleWare,
];

exports.applyCouponOnCartValidator = [
  body("couponName")
    .exists({ checkFalsy: true }).withMessage("couponName is required")
    .bail()
    .custom(async (value) => {
      const coupon = await Coupon.findOne({ name: value });
      if (!coupon) {
        throw new Error("Coupon not found");
      }
      return true;
    }),
  validatorMiddleWare,
];

exports.editQuantityProductInCartValidator = [
  param("itemId")
    .exists({ checkFalsy: true }).withMessage("itemId is required")
    .bail()
    .isMongoId().withMessage("Invalid itemId"),
  body("quantity")
    .exists({ checkFalsy: true }).withMessage("Quantity is required")
    .bail()
    .isInt({ min: 1 }).withMessage("Quantity must be at least 1")
    .bail()
    .custom(async (value, { req }) => {
      const ctx = await findCartItemContext(req);
      if (!ctx) throw new Error("Item not found");

      const product = await Product.findById(ctx.productId);
      if (!product) throw new Error("Product not found");

      const available = [product.quantity, product.quantityInStock, product.stock]
        .find((n) => typeof n === "number");

      if (typeof available === "number" && Number(value) > available) {
        throw new Error("Quantity exceeds available stock");
      }
      return true;
    }),
  validatorMiddleWare,
];

exports.changeCartItemColorValidator = [
  param("itemId")
    .exists({ checkFalsy: true }).withMessage("itemId is required")
    .bail()
    .isMongoId().withMessage("Invalid itemId"),
  body("color")
    .exists({ checkFalsy: true }).withMessage("Color is required")
    .bail()
    .custom(async (value, { req }) => {
      const ctx = await findCartItemContext(req);
      if (!ctx) throw new Error("Item not found");

      const product = await Product.findById(ctx.productId);
      if (!product) throw new Error("Product not found");

      if (!Array.isArray(product.colors) || product.colors.length === 0) {
        throw new Error("This product does not support colors");
      }
      if (!product.colors.includes(value)) {
        throw new Error("Invalid color for this product");
      }

      const available = [product.quantity, product.quantityInStock, product.stock]
        .find((n) => typeof n === "number");

      let targetQty = 0;

      if (ctx.mode === "doc") {
        const target = await Cart.findOne({
          $or: [{ user: ctx.userId }, { userId: ctx.userId }],
          productId: ctx.productId,
          color: value,
          _id: { $ne: ctx.itemId },
        }).lean();
        if (target) targetQty = target.quantity || 0;
      } else {
        // embedded
        const fullCart = await Cart.findOne(
          { user: ctx.userId },
          { cartItems: 1 }
        ).lean();
        let target;
        if (fullCart && Array.isArray(fullCart.cartItems)) {
          target = fullCart.cartItems.find(
            (ci) =>
              String(ci._id) !== String(ctx.itemId) &&
              String(ci.productId || ci.product) === String(ctx.productId) &&
              ci.color === value
          );
        } else {
          target = undefined;
        }
        if (target) targetQty = target.quantity || 0;
      }

      const combined = (ctx.quantity || 0) + targetQty;
      if (typeof available === "number" && combined > available) {
        throw new Error("Combined quantity exceeds available stock");
      }

      return true;
    }),
  validatorMiddleWare,
];

exports.removeProductFromCartValidator = [
  param("itemId")
    .exists({ checkFalsy: true }).withMessage("itemId is required")
    .bail()
    .isMongoId().withMessage("Invalid itemId"),
  validatorMiddleWare,
];
