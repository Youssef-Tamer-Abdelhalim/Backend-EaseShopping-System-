const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");

const User = require("../models/userModel");
const factory = require("./handlersFactroy");
const { uploadSingleImage } = require("../middleware/uploadImageMiddleware");
const ApiError = require("../utils/apiError");
const generateToken = require("../utils/generateToken");

//Upload User Image
exports.uploadUserImage = uploadSingleImage("profileImg");

//Image Processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600, {
        fit: "inside",
      })
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/users/${filename}`);

    // Save with full path for consistency with other models
    req.body.profileImg = `users/${filename}`;
  }

  next();
});

// @desc    Get list of users
// @route   GET /api/v1/users
// @access  Private
exports.getUsers = factory.getAll(User);

// @desc    Get specific user by id
// @route   GET /api/v1/users/:id
// @access  Private
exports.getUser = factory.getOne(User);

// @desc    Create a new user
// @route   POST /api/v1/users
// @access  Private
exports.createUser = factory.createOne(User);

// @desc    Update a specific user
// @route   PUT /api/v1/users/:id
// @access  Private
exports.updateUser = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      slug: req.body.slug,
      profileImg: req.body.profileImg,
      email: req.body.email,
      phone: req.body.phone,
      role: req.body.role,
    },
    { new: true }
  );
  if (!document) {
    next(
      new ApiError(`no ${User.modelName} for this id ${req.params.id}`, 404)
    );
  } else {
    res.status(200).json({ data: document });
  }
});

// @desc    Change user password
// @route   PATCH /api/v1/users/:id/password
// @access  Private
exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 10),
      passwordChangedAt: Date.now(),
    },
    { new: true }
  );
  if (!document) {
    next(
      new ApiError(`no ${User.modelName} for this id ${req.params.id}`, 404)
    );
  } else {
    res.status(200).json({ data: document });
  }
});

// @desc    Delete a specific user
// @route   DELETE /api/v1/users/:id
// @access  Private
exports.deleteUser = factory.deleteOne(User);

// @desc    Get logged user data
// @route   GET /api/v1/users/getMe
// @access  Private/protect
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

// @desc    Update logged user password
// @route   PUT /api/v1/users/updateMyPassword
// @access  Private/protect
exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 10),
      passwordChangedAt: Date.now(),
    },
    { new: true }
  );

  const token = generateToken(user._id);

  res.status(200).json({
    status: "success",
    data: {
      user,
      token,
    },
  });
});

// @desc    Update logged user personal data
// @route   PUT /api/v1/users/updateMe
// @access  Private/protect
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  // Build update object with only provided fields
  const updateData = {};
  if (req.body.name) updateData.name = req.body.name;
  if (req.body.slug) updateData.slug = req.body.slug;
  if (req.body.email) updateData.email = req.body.email;
  if (req.body.phone) updateData.phone = req.body.phone;
  if (req.body.profileImg) updateData.profileImg = req.body.profileImg;

  const document = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
  });

  res.status(200).json({ data: document });
});

// @desc    Deactivate logged user
// @route   DELETE /api/v1/users/deleteMe
// @access  Private/protect
exports.deleteLoggedUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({ status: "success" });
});
