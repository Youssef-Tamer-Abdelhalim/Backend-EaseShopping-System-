const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/apiError");

const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const Coupon = require("../models/couponModel");

const calcTotalCartPrice = (cart) => {
  const total = cart.cartItems.reduce((sum, item) => {
    const qty = Number(item && item.quantity != null ? item.quantity : 0);
    const price = Number(item && item.price != null ? item.price : 0);
    return sum + (Number.isFinite(qty * price) ? qty * price : 0);
  }, 0);
 
  cart.totalCartPrice = Number.isFinite(total) ? total : 0;
  cart.totalCartPriceAfterDiscount = undefined;
  return cart.totalCartPrice;
};

// @desc    Add product to cart
// @route   POST /api/v1/my-cart
// @access  Private
exports.addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId, color } = req.body;
  const product = await Product.findById(productId);
  // 1) Get cart for logged user
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    //create cart for logged user with product
    cart = await Cart.create({
      user: req.user._id,
      cartItems: [
        {
          product: productId,
          color,
          price: product.price,
          productImage: product.imageCover,
          nameOfProduct: product.title,
          description: product.description,
        },
      ],
    });
  } else {
    // 2.1) product exist in cart => update product quantity
    const productIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId && item.color === color
    );
    if (productIndex > -1) {
      const cartItem = cart.cartItems[productIndex];
      cartItem.quantity += 1;
      cart.cartItems[productIndex] = cartItem;
    } else {
      // 2.2) product not exist in cart => add product to cartItems array
      cart.cartItems.push({
        product: productId,
        color,
        price: product.price,
        productImage: product.imageCover,
        nameOfProduct: product.title,
        description: product.description,
      });
    }
  }

  // 3) Calculate total cart price
  calcTotalCartPrice(cart);

  // 4) Save cart
  await cart.save();
  res.status(200).json({
    status: "success",
    numberOfItems: cart.cartItems.reduce((acc, item) => acc + item.quantity, 0),
    data: cart,
  });
});

// @desc    Get my cart
// @route   GET /api/v1/my-cart
// @access  Private
exports.getMyCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(new ApiError(`this is no cart for user ${req.user._id}`, 404));
  }
  res.status(200).json({
    status: "success",
    numberOfItems: cart.cartItems.reduce((acc, item) => acc + item.quantity, 0),
    data: cart,
  });
});

// @desc    remove product from cart
// @route   DELETE /api/v1/my-cart/:itemId
// @access  Private
exports.removeProductFromCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $pull: { cartItems: { _id: req.params.itemId } } },
    { new: true }
  );
  calcTotalCartPrice(cart);
  await cart.save();
  res.status(200).json({
    status: "success",
    numberOfItems: cart.cartItems.reduce((acc, item) => acc + item.quantity, 0),
    data: cart,
  });
});

// @desc    remove all product from cart
// @route   DELETE /api/v1/my-cart
// @access  Private
exports.clearMyCart = asyncHandler(async (req, res, next) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.status(204).send();
});

// @desc    edit quantity of product in cart
// @route   PATCH /api/v1/my-cart/:itemId
// @access  Private
exports.editQuantityProductInCart = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(new ApiError(`No cart found for user ${req.user._id}`, 404));
  }

  const productIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.itemId
  );

  if (productIndex > -1) {
    const cartItem = cart.cartItems[productIndex];
    cartItem.quantity = quantity;
    cart.cartItems[productIndex] = cartItem;
  } else {
    return next(
      new ApiError(`No item found in cart with id ${req.params.itemId}`, 404)
    );
  }

  calcTotalCartPrice(cart);
  await cart.save();
  res.status(200).json({
    status: "success",
    numberOfItems: cart.cartItems.reduce((acc, item) => acc + item.quantity, 0),
    data: cart,
  });
});

// @desc    apply coupon on cart
// @route   PATCH /api/v1/my-cart/applyCoupon
// @access  Private
exports.applyCouponOnCart = asyncHandler(async (req, res, next) => {
  // 1) Get coupon based on coupon name
  const coupon = await Coupon.findOne({
    name: req.body.couponName,
    expiryDate: { $gt: Date.now() },
  });

  if (!coupon) {
    return next(
      new ApiError(`Coupon ${req.body.couponName} is invalid or expired`, 400)
    );
  }

  // 2) Get cart for logged user to get total cart price
  const cart = await Cart.findOne({ user: req.user._id });

  const totalPrice = calcTotalCartPrice(cart);

  // 3) Claculate price after discount
  const discount = (totalPrice * coupon.discountDegree) / 100;
  cart.totalCartPriceAfterDiscount = (
    totalPrice -
    (discount <= coupon.discountMAX ? discount : coupon.discountMAX)
  ).toFixed(2);

  await cart.save();
  res.status(200).json({
    status: "success",
    numberOfItems: cart.cartItems.reduce((acc, item) => acc + item.quantity, 0),
    data: cart,
  });
});

// @desc    change color of a cart item (merge if same product+color exists)
// @route   PATCH /api/v1/my-cart/:itemId/color
// @access  Private
exports.changeCartItemColor = asyncHandler(async (req, res, next) => {
  const { color } = req.body;
  if (!color) return next(new ApiError("color is required", 400));

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new ApiError(`No cart found for user ${req.user._id}`, 404));

  const idx = cart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.itemId
  );
  if (idx === -1)
    return next(new ApiError(`No item found in cart with id ${req.params.itemId}`, 404));

  const item = cart.cartItems[idx];
  
  // Check for duplicate (same product and color)
  const duplicateIdx = cart.cartItems.findIndex(
    (ci) =>
      ci._id.toString() !== item._id.toString() &&
      ci.product.toString() === item.product.toString() &&
      ci.color === color
  );

  if (duplicateIdx > -1) {
    cart.cartItems[duplicateIdx].quantity += item.quantity;
    cart.cartItems.splice(idx, 1);
  } else {
    item.color = color;
    cart.cartItems[idx] = item;
  }

  calcTotalCartPrice(cart);
  await cart.save();

  res.status(200).json({
    status: "success",
    numberOfItems: cart.cartItems.reduce((acc, i) => acc + i.quantity, 0),
    data: cart,
  });
});
