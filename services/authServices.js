const crypto = require("crypto");

const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");

const User = require("../models/userModel");
const ApiError = require("../utils/apiError");
const sendEmail = require("../utils/sendEmail");
const generateToken = require("../utils/generateToken");

// @desc    User signup
// @route   POST /api/v1/auth/signup
// @access  Public
exports.signUp = asyncHandler(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  const token = generateToken(user._id);

  res.status(201).json({
    status: "success signup",
    data: {
      user,
      token,
    },
  });
});

// @desc    User logIn
// @route   POST /api/v1/auth/logIn
// @access  Public
exports.logIn = asyncHandler(async (req, res, next) => {
  // Check if user exists
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Invalid Email or Password", 401));
  }

  const token = generateToken(user._id);

  res.status(200).json({
    status: "success login",
    data: {
      user,
      token,
    },
  });
});

// @desc   make sure the user is logged in
exports.protect = asyncHandler(async (req, res, next) => {
  // 1) Check if token exists, if exists get
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new ApiError(
        "You are not logged in Please log in to access this route",
        401
      )
    );
  }

  // 2) Verify token (no changes happened or expired)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  // 3) Check if user exists
  const currentUser = await User.findById(decoded.userId);
  if (!currentUser) {
    return next(
      new ApiError("The user belonging to this token does no longer exist", 401)
    );
  }

  // 4) Check if user change his password after token created
  if (currentUser.passwordChangedAt) {
    const changedTimestamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );
    if (decoded.iat < changedTimestamp) {
      return next(
        new ApiError(
          "User recently changed password! Please log in again.",
          401
        )
      );
    }
  }

  req.user = currentUser;
  next();
});

// @desc   Authorize by ( User Permissions )
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // 1) access roles
    // 2) access registered user (req.user.role)
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You are not authorized to access this route", 403)
      );
    }
    next();
  });

// @desc   Forget Password
// @route  POST /api/v1/auth/forgetPassword
// @access Public
exports.forgetPassword = asyncHandler(async (req, res, next) => {
  // 1) Get User by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no user with this email ${req.body.email}`, 404)
    );
  }

  // 2) If User exists, Generate 8 digits random number (reset code), hashed the reset code and save it in DB
  const resetCode = Math.floor(10000000 + Math.random() * 90000000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");
  user.passwordResetCode = hashedResetCode;
  user.passwordResetExpires = Date.now() + 1 * 60 * 1000;
  user.passwordResetVerified = false;

  await user.save();
  // 3) Send Email to user with the code

  const htmlMessage = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Ease Shopping | Password Reset Code</title>
  </head>
  <body style="margin:0; padding:0; background:#f3f5f7; font-family:Arial, Helvetica, sans-serif;">

    <!-- Wrapper -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f3f5f7">
      <tr>
        <td align="center" style="padding:24px;">

          <!-- Container -->
          <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%; background:#ffffff; border-radius:12px; box-shadow:0 2px 10px rgba(0,0,0,0.05);">
            
            <!-- Header -->
            <tr>
              <td align="center" style="padding:24px;">
                <img src="https://via.placeholder.com/120x40?text=Ease+Shopping" width="120" height="40" alt="Ease Shopping" style="display:block; border:0;" />
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:24px; text-align:left; color:#0f172a;">
                <h2 style="margin:0 0 12px; font-size:22px;">Password Reset</h2>
                <p style="margin:0 0 20px; font-size:14px; color:#475569;">
                  Hi ${user.name}, here is your password reset confirmation code for your <strong>Ease Shopping</strong> account.
                </p>

                <!-- Code -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;">
                  <tr>
                    <td align="center" style="background:#0b1220; border-radius:10px; padding:14px 16px;">
                      <span style="display:inline-block; font-size:28px; font-family:monospace; letter-spacing:6px; color:#ffffff;">${resetCode}</span>
                    </td>
                  </tr>
                </table>

                <!-- Validity -->
                <p style="margin:0 0 20px; font-size:14px; color:#334155;">
                  This code is valid for <strong>1 minute</strong> from the time you received this email.
                </p>

                <!-- Security note -->
                <p style="margin:8px 0 0; font-size:12px; color:#94a3b8;">
                  Do not share this code with anyone. The Ease Shopping support team will never ask you for this code by email or phone.
                </p>

                <!-- Divider -->
                <hr style="border:none; border-top:1px solid #e5e7eb; margin:20px 0;" />

                <!-- Footer -->
                <p style="margin:0 0 6px; font-size:12px; color:#94a3b8; text-align:center;">
                  Best regards, <strong>Ease Shopping Team</strong>
                </p>
                <p style="margin:0; font-size:11px; color:#94a3b8; text-align:center;">
                  If you did not request this action, you can safely ignore this email.
                </p>
              </td>
            </tr>

            <!-- Legal Footer -->
            <tr>
              <td align="center" style="padding:16px; font-size:11px; color:#94a3b8;">
                © 2025 Ease Shopping. All rights reserved.
              </td>
            </tr>

          </table>
          <!-- End Container -->

        </td>
      </tr>
    </table>

  </body>
</html>`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Password Reset Code",
      html: htmlMessage,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();
    return next(
      new ApiError("There is an error in sending email, Try again later", 500)
    );
  }

  res.status(200).json({
    status: "success",
    message: "Password reset code sent to email!",
  });
});

// @desc Verify password reset code
// @route POST /api/v1/auth/verifyresetcode
// @access Public
exports.verifyPasswordResetCode = asyncHandler(async (req, res, next) => {
  // 1) get user based on ( passwordResetCode )
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiError("Invalid or expired reset code", 400));
  }

  // 2) reset code valid
  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Password reset successful!",
  });
});

// @desc Reset password
// @route POST /api/v1/auth/resetPassword
// @access Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 1) get user based on email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no user with this email ${req.body.email}`, 404)
    );
  }

  // 2) if reset code verified (passwordResetVerified = true)
  if (!user.passwordResetVerified) {
    return next(new ApiError("reset code not verified ", 400));
  }

  // 3) if new password and confirm password match
  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ApiError("Passwords do not match", 400));
  }

  // 4) update user password and reset fields and save it in DB
  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;
  await user.save();

  // 5)Generate a new token For user with new password
  const token = generateToken(user._id);

  res.status(200).json({
    status: "success",
    message: "Password reset successful!",
    token,
  });
});
