const crypto = require("crypto");

const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");

const User = require("../models/userModel");
const ApiError = require("../utils/apiError");
const sendEmail = require("../utils/sendEmail");
const { generateAccessToken, generateRefreshToken, hashToken } = require("../utils/generateToken");
const { verificationEmailTemplate, passwordResetEmailTemplate } = require("../utils/emailTemplates");

// ─── Private Helpers ──────────────────────────────────────────────────────────

/**
 * Generates a random numeric code, returns both the plaintext and its SHA-256 hash.
 * @param {number} digits - number of digits (default 6)
 */
const createHashedCode = (digits = 6) => {
  const code = Math.floor(
    10 ** (digits - 1) + Math.random() * (9 * 10 ** (digits - 1))
  ).toString();
  const hashed = crypto.createHash("sha256").update(code).digest("hex");
  return { code, hashed };
};

/**
 * Issues an access + refresh token pair for a user.
 * Saves the hashed refresh token to the DB and sets it as an HttpOnly cookie.
 * Returns the plaintext access token.
 */
const issueTokenPair = async (user, res) => {
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return accessToken;
};

/**
 * Generates a 6-digit verification code, saves its hash to the user,
 * and sends the verification email.
 */
const dispatchVerificationEmail = async (user) => {
  const { code, hashed } = createHashedCode(6);

  user.emailVerificationCode = hashed;
  user.emailVerificationExpires = Date.now() + 15 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  await sendEmail({
    to: user.email,
    subject: "Verify Your Email Address",
    html: verificationEmailTemplate({ name: user.name, code }),
  });
};

// ─── Signup & Email Verification ─────────────────────────────────────────────

// @desc    Create new account and send verification email
// @route   POST /api/v1/auth/signup
// @access  Public
exports.signUp = asyncHandler(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    emailVerified: false,
  });

  try {
    await dispatchVerificationEmail(user);
  } catch {
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new ApiError(
        "Account created but verification email failed. Please request a new code.",
        500
      )
    );
  }

  res.status(201).json({
    status: "success",
    message: "Account created. Please check your email to verify your account.",
    data: { user: { _id: user._id, name: user.name, email: user.email } },
  });
});

// @desc    Verify email with the 6-digit code
// @route   POST /api/v1/auth/verifyemail
// @access  Public
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  const hashed = crypto
    .createHash("sha256")
    .update(req.body.verificationCode)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationCode: hashed,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) return next(new ApiError("Invalid or expired verification code.", 400));

  user.emailVerified = true;
  user.emailVerificationCode = undefined;
  user.emailVerificationExpires = undefined;

  const accessToken = await issueTokenPair(user, res);

  res.status(200).json({
    status: "success",
    message: "Email verified successfully.",
    data: { user, accessToken },
  });
});

// @desc    Resend email verification code
// @route   POST /api/v1/auth/resendverification
// @access  Public
exports.resendVerificationEmail = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user)
    return next(new ApiError(`No account found with email ${req.body.email}.`, 404));

  if (user.emailVerified)
    return next(new ApiError("This email is already verified.", 400));

  try {
    await dispatchVerificationEmail(user);
  } catch {
    return next(new ApiError("Failed to send verification email. Try again later.", 500));
  }

  res.status(200).json({
    status: "success",
    message: "Verification code sent to your email.",
  });
});

// ─── Login / Logout / Token Refresh ──────────────────────────────────────────

// @desc    Login and receive access + refresh tokens
// @route   POST /api/v1/auth/login
// @access  Public
exports.logIn = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user || !(await bcrypt.compare(req.body.password, user.password)))
    return next(new ApiError("Invalid email or password.", 401));

  if (user.emailVerified === false)
    return next(
      new ApiError(
        "Please verify your email before logging in. Check your inbox or request a new code.",
        403
      )
    );

  const accessToken = await issueTokenPair(user, res);

  // لا نرسل الباسورد في الـ response
  user.password = undefined;

  res.status(200).json({ status: "success", data: { user, accessToken } });
});

// @desc    Issue a new access token using the refresh token cookie
// @route   POST /api/v1/auth/refresh
// @access  Public
exports.refreshAccessToken = asyncHandler(async (req, res, next) => {
  const token = req.cookies && req.cookies.refreshToken;
  if (!token) return next(new ApiError("No refresh token provided.", 401));

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET_KEY);
  } catch {
    return next(new ApiError("Invalid or expired refresh token. Please log in again.", 401));
  }

  const user = await User.findById(decoded.userId);
  if (!user || user.refreshToken !== hashToken(token))
    return next(new ApiError("Session expired. Please log in again.", 401));

  const accessToken = generateAccessToken(user._id, user.role);
  res.status(200).json({ status: "success", accessToken });
});

// @desc    Logout and invalidate refresh token
// @route   POST /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res) => {
  req.user.refreshToken = undefined;
  await req.user.save({ validateBeforeSave: false });
  res.clearCookie("refreshToken");
  res.status(200).json({ status: "success", message: "Logged out successfully." });
});

// ─── Guard Middleware ─────────────────────────────────────────────────────────

// @desc    Protect route — verify access token and attach user to req
exports.protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer"))
    return next(new ApiError("You are not logged in. Please log in to access this route.", 401));

  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  const currentUser = await User.findById(decoded.userId);
  if (!currentUser)
    return next(new ApiError("The account belonging to this token no longer exists.", 401));

  if (currentUser.passwordChangedAt) {
    const changedAt = parseInt(currentUser.passwordChangedAt.getTime() / 1000, 10);
    if (decoded.iat < changedAt)
      return next(new ApiError("Password was recently changed. Please log in again.", 401));
  }

  if (currentUser.emailVerified === false)
    return next(new ApiError("Please verify your email address to access this route.", 403));

  req.user = currentUser;
  next();
});

// @desc    Restrict route to specific roles
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(new ApiError("You are not authorized to access this route.", 403));
    next();
  });

// ─── Password Reset ───────────────────────────────────────────────────────────

// @desc    Send password reset code to email
// @route   POST /api/v1/auth/forgetpassword
// @access  Public
exports.forgetPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new ApiError(`No account found with email ${req.body.email}.`, 404));

  const { code, hashed } = createHashedCode(8);
  user.passwordResetCode = hashed;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  user.passwordResetVerified = false;

  try {
    await user.save({ validateBeforeSave: false });
    await sendEmail({
      to: user.email,
      subject: "Password Reset Code",
      html: passwordResetEmailTemplate({ name: user.name, code }),
    });
  } catch {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ApiError("Failed to send reset email. Try again later.", 500));
  }

  res.status(200).json({ status: "success", message: "Password reset code sent to your email." });
});

// @desc    Verify the 8-digit password reset code
// @route   POST /api/v1/auth/verifyresetcode
// @access  Public
exports.verifyPasswordResetCode = asyncHandler(async (req, res, next) => {
  const hashed = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await User.findOne({
    passwordResetCode: hashed,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return next(new ApiError("Invalid or expired reset code.", 400));

  user.passwordResetVerified = true;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ status: "success", message: "Reset code verified." });
});

// @desc    Set new password after reset code is verified
// @route   PUT /api/v1/auth/resetpassword
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new ApiError(`No account found with email ${req.body.email}.`, 404));

  if (!user.passwordResetVerified)
    return next(new ApiError("Reset code has not been verified.", 400));

  if (req.body.newPassword !== req.body.confirmPassword)
    return next(new ApiError("Passwords do not match.", 400));

  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;
  await user.save(); // triggers bcrypt pre-save hook

  const accessToken = await issueTokenPair(user, res);

  res.status(200).json({
    status: "success",
    message: "Password reset successful.",
    accessToken,
  });
});
