const cloudinary = require('cloudinary').v2;

// ضبط الإعدادات من ملف الـ .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// بنصدر بس الكلاوديناري عشان نستخدمه في الميدل وير
module.exports = { cloudinary };