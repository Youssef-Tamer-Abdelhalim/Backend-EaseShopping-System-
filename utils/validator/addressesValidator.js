const { check, body } = require("express-validator");
const validatorMiddleWare = require("../../middleware/validatorMiddleWare");
const User = require("../../models/userModel");

exports.addAddressesValidator = [
  body("alias")
    .notEmpty()
    .withMessage("alias is required")
    .custom(async (val) => {
      const user = await User.findOne({ "addresses.alias": val });
      if (user) {
        return Promise.reject(new Error("Alias already in use"));
      }
    }),
  body("details").notEmpty().withMessage("details is required"),
  body("phone")
    .notEmpty()
    .withMessage("phone is required")
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number format")
    .custom((val) =>
      User.findOne({ phone: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("Phone number already in use"));
        }
      })
    ),
  body("city").notEmpty().withMessage("city is required"),
  body("postalCode")
    .notEmpty()
    .withMessage("postalCode is required")
    .isPostalCode("any")
    .withMessage("Invalid postal code format"),
  validatorMiddleWare,
];

exports.removeAddressesValidator = [
  check("addressId")
    .notEmpty()
    .withMessage("addressId is required")
    .isMongoId()
    .withMessage("Invalid addressId format"),
  validatorMiddleWare,
];
