const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters long"],
      maxlength: [100, "Title must be at most 100 characters long"],
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [30, "Description must be at least 30 characters long"],
      maxlength: [2000, "Description must be at most 2000 characters long"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity must be a positive number"],
    },
    sold: {
      type: Number,
      default: 0,
      min: [0, "Quantity must be a positive number"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be a positive number"],
      max: [100000000000000, "Price must not exceed 100000000000000 "],
    },
    priceAfterDiscount: {
      type: Number,
      min: [0, "Price After Discount must be a positive number"],
      max: [100000000000000, "Price After Discount must not exceed 100000000000000 "],
    },
    colors: [String],
    imageCover: {
      type: String,
      required: [true, "Image cover is required"],
    },
    images: [String],
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    subCategory: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "SupCategory",
      },
    ],
    brand: {
      type: mongoose.Schema.ObjectId,
      ref: "Brand",
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: [0, "Rating must be above 0.0"],
      max: [5, "Rating must be below 5.0"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "product",
  localField: "_id",
});

productSchema.pre(/^find/, function (next) {
  this.populate({ path: "category", select: "name -_id" });
  this.populate({ path: "subCategory", select: "name -_id" });
  this.populate({ path: "brand", select: "name -_id" });
  next();
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
// Compound index covers the most common filter+sort pattern (by category, rating, price)
productSchema.index({ category: 1, ratingsAverage: -1, price: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
// Text index for full-text search — title weighted 10x higher than description
productSchema.index(
  { title: "text", description: "text" },
  { weights: { title: 10, description: 1 }, name: "product_text_search" }
);

module.exports = mongoose.model("Product", productSchema);