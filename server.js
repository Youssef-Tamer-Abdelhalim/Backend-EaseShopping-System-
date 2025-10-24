const path = require("path");

const express = require("express");

require("./utils/env");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

const dbConnection = require("./config/database");
const globalErrorHandler = require("./middleware/errorMiddleware");
const ApiError = require("./utils/apiError");
const { webhookCheckoutHandler } = require("./services/orderServices");
const {
  corsMiddleware,
  securityHeaders,
  preflightHandler,
} = require("./middleware/corsMiddleware");

const mountRoute = require("./routes/index");

// create a new express app instance and use express.json middleware to parse request bodies
const app = express();

/* ---------------------------- CORS & Security ---------------------------- */
// Apply CORS middleware
app.use(corsMiddleware);

// Apply security headers
app.use(securityHeaders);

// Handle preflight requests
app.use(preflightHandler);
/* ------------------------- END CORS & Security --------------------------- */

// compress all responses
app.use(compression());

// checkout webhook
app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  webhookCheckoutHandler
);

app.set("query parser", "extended");
app.use(express.json({ limit: "40kb" }));
app.use(express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
} else if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// limit requests from same API
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: "Too many requests from this IP, please try again after 15 minutes",
});

app.use("/api", limiter);

// mount route
mountRoute(app);

// handle 404 errors or any Route Not Found
app.use((req, res, next) => {
  next(new ApiError(`Can't find this route ${req.originalUrl}`, 400));
});

// Global error handler middleware
app.use(globalErrorHandler);

// --- start server function ---
const startServer = async () => {
  // import database connection
  dbConnection();

  const PORT = process.env.PORT || 8000;
  const server = app.listen(PORT, () => {
    console.log(`Server app listening on PORT ${PORT}`);
  });

  // handle rejection outside express
  process.on("unhandledRejection", (err) => {
    console.error(
      `\nUnhandled Rejection Error:\n{ \n\t${err.name} \n\t${err.message}\n}`
    );
    server.close(() => {
      console.log("Server Shutting down ............ 🤕 (X_X)");
      process.exit(1);
    });
  });
};

startServer();
