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

  return multer({ storage: storage, fileFilter: multerFilter });
};

// الوظيفة العبقرية لتجهيز الروابط
exports.setCloudinaryUrls = (fields) => (req, res, next) => {
  // 1) حالة الرفع المنفرد (req.file)
  if (req.file) {
    // fields هنا غالباً ستكون اسم الحقل كنص 'image'
    const fieldName = typeof fields === "string" ? fields : fields[0].name || fields[0];
    req.body[fieldName] = req.file.path;
  } 
  
  // 2) حالة الرفع المختلط (req.files)
  else if (req.files) {
    fields.forEach((field) => {
      const fieldName = typeof field === "string" ? field : field.name;

      if (req.files[fieldName]) {
        if (req.files[fieldName].length === 1 && (field.maxCount === 1 || typeof field === "string")) {
          req.body[fieldName] = req.files[fieldName][0].path;
        } else {
          req.body[fieldName] = req.files[fieldName].map((img) => img.path);
        }
      } else if (fieldName === "images") {
        req.body[fieldName] = [];
      }
    });
  }
  next();
};

exports.uploadSingleImage = (fieldName, folderName) => multerOptions(folderName).single(fieldName);
exports.uploadMixOfImages = (arrayOfFields, folderName) => multerOptions(folderName).fields(arrayOfFields);