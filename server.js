const path = require("path");

const express = require("express");

require("./utils/env");
const morgan = require("morgan");
const compression = require("compression");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const sanitize = require("./middleware/sanitizeMiddleware");

const dbConnection = require("./config/database");
const globalErrorHandler = require("./middleware/errorMiddleware");
const ApiError = require("./utils/apiError");
const { webhookCheckoutHandler } = require("./services/orderServices");
const { corsMiddleware, preflightHandler } = require("./middleware/corsMiddleware");
const { globalLimiter } = require("./middleware/rateLimitMiddleware");

const mountRoute = require("./routes/index");

const app = express();

// Morgan first — so every request is logged regardless of downstream errors
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
} else if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// checkout webhook - MUST be before CORS and express.json() middleware
// Stripe sends raw body and no Origin header
app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  webhookCheckoutHandler
);

/* ---------------------------- CORS & Security ---------------------------- */
// Security headers (helmet must come before CORS)
app.use(
  helmet({
    // Allow cross-origin requests so frontend can consume the API
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Apply CORS middleware
app.use(corsMiddleware);

// Handle preflight requests
app.use(preflightHandler);
/* ------------------------- END CORS & Security --------------------------- */

// compress all responses
app.use(compression());

app.set("query parser", "extended");
app.use(express.json({ limit: "40kb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "uploads")));

// NoSQL injection + XSS protection — custom middleware compatible with Express 5
// (express-mongo-sanitize and xss-clean both fail on Express 5's read-only req.query)
app.use(sanitize);

// Rate limiting — 500 requests per 15 minutes per IP
app.use("/api", globalLimiter);

// mount route
mountRoute(app);

// handle 404 errors or any Route Not Found
app.use((req, res, next) => {
  next(new ApiError(`Can't find this route ${req.originalUrl}`, 404));
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
