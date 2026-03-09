const express = require("express"); //هنا عملنا require لى express عشان يشتغل

const {
  signUp,
  logIn,
  forgetPassword,
  verifyPasswordResetCode,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  refreshAccessToken,
  logout,
} = require("../services/authServices");

const {
  signUpValidator,
  logInValidator,
  forgetPasswordValidator,
  verifyResetCodeValidator,
  resetPasswordValidator,
  verifyEmailValidator,
  resendVerificationValidator,
} = require("../utils/validator/authValidator");

const { authLimiter } = require("../middleware/rateLimitMiddleware");
const authServices = require("../services/authServices");

const router = express.Router();

router.use(authLimiter);

router.post("/signup", signUpValidator, signUp);
router.post("/login", logInValidator, logIn);
router.post("/verifyemail", verifyEmailValidator, verifyEmail);
router.post("/resendverification", resendVerificationValidator, resendVerificationEmail);
router.post("/refresh", refreshAccessToken);
router.post("/logout", authServices.protect, logout);
router.post("/forgetpassword", forgetPasswordValidator, forgetPassword);
router.post("/verifyresetcode", verifyResetCodeValidator, verifyPasswordResetCode);
router.put("/resetpassword", resetPasswordValidator, resetPassword);

module.exports = router;
