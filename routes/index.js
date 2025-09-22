
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

const mountRoute = (app) => {
// mount route
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/subcategories", subCategoryRoutes);
app.use("/api/v1/brands", brandRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/addresses", addressesRoutes);
app.use("/api/v1/coupons", couponRoutes);
app.use("/api/v1/my-cart", cartRoutes);
app.use("/api/v1/orders", orderRoutes);
}

module.exports = mountRoute;