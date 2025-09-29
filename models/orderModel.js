const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cartItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: Number,
        color: String,
        price: Number,
        productImage: String,
        nameOfProduct: String,
        description: String,
      },
    ],
    taxPrice: { type: Number, default: 0.0 },
    shippingPrice: { type: Number, default: 0.0 },
    shippingAddress: {
      details: String,
      phone: String,
      city: String,
      postalCode: String,
      country: {
      code: {
        type: String,
        enum: ['AD', 'AT', 'AU', 'AZ', 'BA', 'BE', 'BG', 'BR', 'BY', 'CA', 'CH', 'CN', 'CZ', 'DE', 'DK', 'DO', 'DZ', 'EE', 'ES', 'FI', 'FR', 'GB', 'GR', 'HR', 'HT', 'HU', 'ID', 'IL', 'IN', 'IR', 'IS', 'IT', 'JP', 'KE', 'KR', 'LI', 'LK', 'LT', 'LU', 'LV', 'MT', 'MX', 'MY', 'NL', 'NO', 'NP', 'NZ', 'PL', 'PR', 'PT', 'RO', 'RU', 'SA', 'SE', 'SG', 'SI', 'SK', 'TH', 'TN', 'TW', 'UA', 'US', 'ZA', 'ZM', 'EG'],
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    },
  },
    totalOrderPrice: { type: Number, required: true },
    paymentMethodType: {
      type: String,
      enum: ["online", "cash"],
      default: "cash",
    },
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    isDelivered: { type: Boolean, default: false },
    deliveredAt: Date,
  },
  { timestamps: true }
);

orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name email phone profileImg avatar",
  }).populate({ path: "cartItems.product", select: "title price imageCover " });
  next();
});

module.exports = mongoose.model("Order", orderSchema);
