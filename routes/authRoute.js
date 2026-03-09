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
  forgetPasswordValidator,
  verifyResetCodeValidator,
  resetPasswordValidator,
} = require("../utils/validator/authValidator");

const { authLimiter } = require("../middleware/rateLimitMiddleware");

const router = express.Router();

router.use(authLimiter);

router.post("/signup", signUpValidator, signUp);
router.post("/login", logInValidator, logIn);
router.post("/forgetpassword", forgetPasswordValidator, forgetPassword);
router.post("/verifyresetcode", verifyResetCodeValidator, verifyPasswordResetCode);
router.put("/resetpassword", resetPasswordValidator, resetPassword);

module.exports = router;
