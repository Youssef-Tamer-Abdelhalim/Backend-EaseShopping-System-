const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    cartItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        }, 
        quantity: { type: Number, default: 1 },
        color: String, 
        price: Number,
        productImage: String,
        nameOfProduct: String,
        description: String,
      },
    ],
    totalCartPrice: Number,
    totalCartPriceAfterDiscount: Number,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// sparse:true allows documents without a user field to coexist without violating uniqueness
cartSchema.index({ user: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Cart", cartSchema);
