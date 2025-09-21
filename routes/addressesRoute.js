const express = require("express");

const { addAddress, removeAddress, getLoggedUserAddresses } = require("../services/addressesServices");

const { addAddressesValidator, removeAddressesValidator } = require("../utils/validator/addressesValidator");

const authServices = require("../services/authServices");

const router = express.Router();

router.use(authServices.protect, authServices.allowedTo("user"))

router
  .route("/")
  .post(addAddressesValidator, addAddress)
  .get(getLoggedUserAddresses);

router
  .route("/:addressId")
  .delete(removeAddressesValidator, removeAddress);

module.exports = router;