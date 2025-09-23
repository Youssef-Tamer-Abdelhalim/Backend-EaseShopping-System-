const stripe = require("stripe")(process.env.STRIPE_SECRET);
const asyncHandler = require("express-async-handler");

const factory = require("./handlersFactroy");
const ApiError = require("../utils/apiError");

const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");

// @desc    Create new order
// @route   POST /api/v1/orders/:cartId
// @access  Private
exports.createOrder = asyncHandler(async (req, res, next) => {
  // ### @I need change it when make a dashboard for admin ###
  const taxPrice = 0;
  const shippingPrice = 0.0;
  // ### _________________________________________________ ###

  // 1) get cart based on cartId from params
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(new ApiError("No cart found for this user", 404));
  }
  // 2) get order price debaned on cart price and check if has coupon
  const orderPrice = cart.totalCartPriceAfterDiscount
    ? cart.totalCartPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = orderPrice + shippingPrice + taxPrice;

  // 3) create order with default payment method (cash)
  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
  });

  // 4) After creating order, decrement product quantity, increment sold
  if (order) {
    const bulkOptoin = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOptoin, {});

    // 5) clear cart based on cartId from params
    await Cart.findByIdAndDelete(req.params.cartId);

    res.status(201).json({
      status: "success",
      data: order,
    });
  }
});

exports.filterOrderForLoggedUser = asyncHandler(async (req, res, next) => {
  if (req.user.role === "user") req.filter = { user: req.user._id };
  next();
});

// @desc    Get logged user orders
// @route   GET /api/v1/orders
// @access  Private
exports.getLoggedUserOrders = factory.getAll(Order);

// @desc    Get specific order by id
// @route   GET /api/v1/orders/:id
// @access  Private
exports.getOrderById = factory.getOne(Order);

// @desc    update order paid status to paid
// @route   PUT /api/v1/orders/:id/pay
// @access  Private
exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(
      new ApiError(`No order found with this id ${req.params.id}`, 404)
    );
  }

  order.isPaid = true;
  order.paidAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({
    status: "success",
    data: updatedOrder,
  });
});

// @desc    update order delivery status to delivered
// @route   PUT /api/v1/orders/:id/deliver
// @access  Private
exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(
      new ApiError(`No order found with this id ${req.params.id}`, 404)
    );
  }

  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({
    status: "success",
    data: updatedOrder,
  });
});

// @desc    get checkout session from stripe and send it as response
// @route   POST /api/v1/orders/checkout-session/:cartId
// @access  Private
exports.getCheckoutSession = asyncHandler(async (req, res, next) => {
  // ### @I need change it when make a dashboard for admin ###
  const taxPrice = 0;
  const shippingPrice = 0.0;
  // ### _________________________________________________ ###

  // 1) get cart based on cartId from params
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(new ApiError("No cart found for this user", 404));
  }
  // 2) get order price debaned on cart price and check if has coupon
  const orderPrice = cart.totalCartPriceAfterDiscount
    ? cart.totalCartPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = orderPrice + shippingPrice + taxPrice;

  // 3) create stripe checkout session
  // Stripe (latest API versions) no longer accepts unit_amount/name directly under line_items
  // Use price_data with product_data, and ensure all metadata values are strings.
  const shippingAddress = req.body.shippingAddress || {};
  const metadata = {};
  Object.entries(shippingAddress).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (key === "country" && typeof value === "object") {
      if (value.code) metadata["country code"] = String(value.code);
      if (value.name) metadata["country name"] = String(value.name);
      return;
    }

    if (typeof value === "object") {
      metadata[key] = JSON.stringify(value);
    } else {
      metadata[key] = String(value);
    }
  });

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: Math.round(totalOrderPrice * 100), // amount in cents
          product_data: {
            name: `Order for ${req.user.name}`,
          },
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/api/v1/orders`,
    cancel_url: `${req.protocol}://${req.get("host")}/api/v1/cart`,
    customer_email: req.user.email,
    client_reference_id: req.params.cartId,
    metadata,
  });

  // 4) send session as response
  res.status(200).json({
    status: "success",
    session,
  });
});

const createCardOrder = async (session) => { 
  // 1) get cart, user & order price
  const cartId = session.client_reference_id;
  const shippingAddress = session.metadata;
  const orderPrice = session.amount_total / 100;
  const cart = await Cart.findById(cartId);
  const user = await User.findOne({ email: session.customer_email });

  // 2) create order with payment method (card)
    const order = await Order.create({
    user: user._id,
    cartItems: cart.cartItems,
    shippingAddress,
    totalOrderPrice: orderPrice,
    isPaid: true,
    paidAt: Date.now(),
    paymentMethod: "card",
  });

  // 3) After creating order, decrement product quantity, increment sold
  if (order) {
    const bulkOptoin = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOptoin, {});

    // 4) clear cart based on cartId from params
    await Cart.findByIdAndDelete(cartId);
  }
}

// @desc    webhook checkout handler
// @route   POST /webhook-checkout
// @access  Private = user 
exports.webhookCheckoutHandler = asyncHandler(async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === "checkout.session.completed") {
    createCardOrder(event.data.object);
  }

  res.status(200).json({ received: true });
});