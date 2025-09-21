const mongoose = require("mongoose");

const Product = require("./productModel");

const reviewSchema = new mongoose.Schema(
  {
    content: {
      type: String,
    },
    rating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must can not be more than 5"],
      required: [true, "Rating is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },
    // Parent reference (one-to-many relationship) when one product has many reviews
    product: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Review must belong to a product"],
    },
  },
  { timestamps: true }
);

// pre middleware to populate user data
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name profileImg avatar" 
  });
  next();
});

// Static method to calculate average ratings and quantity
reviewSchema.statics.calcAverageRatingsAndQuantity = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId } },
    { $group: {
        _id: "$product",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" }
      }
    }
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: 0,
      ratingsAverage: 0
    });
  }
}

// Post middleware to update product ratings after saving a review
reviewSchema.post("save", async function () {
  await this.constructor.calcAverageRatingsAndQuantity(this.product);
});

// Post middleware to update product ratings after removing a review
reviewSchema.post("deleteOne", { document: true }, async function () {
  await this.constructor.calcAverageRatingsAndQuantity(this.product);
});

module.exports = mongoose.model("Review", reviewSchema);
