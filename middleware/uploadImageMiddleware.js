const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { cloudinary } = require("../config/cloudinary"); 
const ApiError = require("../utils/apiError");

const multerOptions = (folderName) => {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `e-commerce/${folderName}`,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ width: 1000, height: 1000, crop: "limit" }],
    },
  });

  const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new ApiError("Not an image! Please upload an image.", 400), false);
    }
  };

  const upload = multer({ storage: storage, fileFilter: multerFilter });
  return upload;
};

exports.uploadSingleImage = (fieldName, folderName) => multerOptions(folderName).single(fieldName);

exports.uploadMixOfImages = (arrayOfFields, folderName) => multerOptions(folderName).fields(arrayOfFields);