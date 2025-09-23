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

router.post("/:cartId", authServices.allowedTo("user"), createOrder);
router.post(
  "/checkout-session/:cartId",
  authServices.allowedTo("user"),
  getCheckoutSession
);

router.get("/:id", authServices.allowedTo("admin", "manager"), getOrderById);


router.patch("/:id/deliver", authServices.allowedTo("admin", "manager"), updateOrderToDelivered);
router.patch("/:id/pay", authServices.allowedTo("admin", "manager"), updateCashOrderToPaid);

router.get(
  "/",
  authServices.allowedTo("user", "admin", "manager"),
  filterOrderForLoggedUser,
  getLoggedUserOrders
);

module.exports = router;
