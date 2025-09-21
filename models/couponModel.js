const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "Name is required"],
    unique: [true, "Name must be unique"],
  },
  discountDegree: {
    type: Number,
    required: [true, "Discount Degree is required"],
    min: [0, "Discount Degree must be positive"],
  },
  discountMAX:{
    type: Number,
    required: [true, "Maximum discount is required"],
    min: [0, "Maximum discount must be positive"],
  },
  expiryDate: {
    type: Date,
    required: [true, "Expiry date is required"],
  },
}, { timestamps: true });

module.exports = mongoose.model("Coupon", couponSchema);