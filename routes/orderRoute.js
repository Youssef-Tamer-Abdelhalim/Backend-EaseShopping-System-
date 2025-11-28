const express = require("express");
const {
  createOrder,
  getLoggedUserOrders,
  getOrderById,
  filterOrderForLoggedUser,
  updateOrderToDelivered,
  updateCashOrderToPaid,
  getCheckoutSession,
} = require("../services/orderServices");

const router = express.Router();

const authServices = require("../services/authServices");

router.use(authServices.protect);

// Static routes MUST come before dynamic routes (/:id)
router.get(
  "/my-orders",
  authServices.allowedTo("user"),
  filterOrderForLoggedUser,
  getLoggedUserOrders
);

router.post(
  "/checkout-session/:cartId",
  authServices.allowedTo("user"),
  getCheckoutSession
);
router.post("/:cartId", authServices.allowedTo("user"), createOrder);

// GET / - Admin/Manager get ALL orders, User gets only their orders
router.get(
  "/",
  authServices.allowedTo("admin", "manager"),
  getLoggedUserOrders
);

// Dynamic routes with :id MUST come after static routes
router.get("/:id", authServices.allowedTo("admin", "manager"), getOrderById);
router.patch(
  "/:id/deliver",
  authServices.allowedTo("admin", "manager"),
  updateOrderToDelivered
);
router.patch(
  "/:id/pay",
  authServices.allowedTo("admin", "manager"),
  updateCashOrderToPaid
);

module.exports = router;
