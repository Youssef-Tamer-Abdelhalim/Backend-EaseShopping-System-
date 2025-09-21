const express = require("express"); //هنا عملنا require لى express عشان يشتغل

const {
  signUp,
  logIn,
  forgetPassword,
  verifyPasswordResetCode,
  resetPassword,
} = require("../services/authServices");

const {
  signUpValidator,
  logInValidator,
} = require("../utils/validator/authValidator");

const router = express.Router();

router.post("/signup", signUpValidator, signUp);
router.post("/login", logInValidator, logIn);
router.post("/forgetpassword", forgetPassword);
router.post("/verifyresetcode", verifyPasswordResetCode);
router.put("/resetpassword", resetPassword);

module.exports = router;
