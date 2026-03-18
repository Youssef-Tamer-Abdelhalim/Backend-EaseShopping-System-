
// import routes
const categoryRoutes = require("./categoryRoute");
const subCategoryRoutes = require("./subCategoryRoute");
const brandRoutes = require("./brandRoute");
const productRoutes = require("./productRoute"); 
const userRoutes = require("./userRoute");
const authRoutes = require("./authRoute");
const reviewRoutes = require("./reviewRoute");
const wishlistRoutes = require("./wishlistRoute");
const addressesRoutes = require("./addressesRoute");
const couponRoutes = require("./couponRoute");
const cartRoutes = require("./cartRoute");
const orderRoutes = require("./orderRoute");

const rateLimit = require("express-rate-limit");

// Rate limiter for auth routes (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window per IP
  message: {
    status: "Fail",
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const mountRoute = (app) => {
// mount route
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/subcategories", subCategoryRoutes);
app.use("/api/v1/brands", brandRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/addresses", addressesRoutes);
app.use("/api/v1/coupons", couponRoutes);
app.use("/api/v1/my-cart", cartRoutes);
app.use("/api/v1/orders", orderRoutes);
}

module.exports = mountRoute;