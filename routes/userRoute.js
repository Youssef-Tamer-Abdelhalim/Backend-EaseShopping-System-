const express = require("express"); //هنا عملنا require لى express عشان يشتغل

const {
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  uploadUserImage,
  resizeImage,
  changeUserPassword,
  getLoggedUserData,
  updateLoggedUserPassword,
  updateLoggedUserData,
  deleteLoggedUser,
} = require("../services/userServices");

const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
  changeLoggedUserPasswordValidator,
  updateLoggedUserValidator,
} = require("../utils/validator/userValidator");

const authServices = require("../services/authServices");

const router = express.Router();

router.get("/getMe", authServices.protect, getLoggedUserData, getUser);
router.put(
  "/updateMyPassword",
  authServices.protect,
  changeLoggedUserPasswordValidator,
  updateLoggedUserPassword
);
router.put(
  "/updateMe",
  authServices.protect,
  uploadUserImage,
  resizeImage,
  updateLoggedUserValidator,
  updateLoggedUserData
);
router.delete("/deleteMe", authServices.protect, deleteLoggedUser);

router.use(authServices.protect, authServices.allowedTo("admin"));
router.put(
  "/change-password/:id",
  changeUserPasswordValidator,
  changeUserPassword
);

router
  .route("/")
  .get(getUsers)
  .post(uploadUserImage, resizeImage, createUserValidator, createUser);

router
  .route("/:id")
  .get(getUserValidator, getUser)
  .put(uploadUserImage, resizeImage, updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);

module.exports = router;
