const mongoose = require("mongoose"); // هنا استدعينا mongoose

// هنا بنعمل schema للكاتيجورى من docs mongoose
const supCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Name is required"],
      unique: [true, "Name must be unique"],
      minlength: [1, "Name must be at least 1 character long"],
      maxlength: [64, "Name must be at most 64 characters long"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      lowercase: true,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
  },
  { timestamps: true }
);

const SupCategoryModel = mongoose.model("SupCategory", supCategorySchema);

module.exports = SupCategoryModel;