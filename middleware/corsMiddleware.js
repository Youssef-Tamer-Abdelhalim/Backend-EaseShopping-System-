const cors = require("cors");

// Parse allowed origins from environment variable
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl, same-origin, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (allowedOrigins.length > 0 && allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // In development, allow localhost
    if (
      process.env.NODE_ENV === "development" &&
      origin.includes("localhost")
    ) {
      return callback(null, true);
    }

    // If CORS_ORIGINS is not configured, allow all in development
    if (allowedOrigins.length === 0 && process.env.NODE_ENV === "development") {
      return callback(null, true);
    }

    // Log blocked origin for debugging
    console.warn(`🚫 CORS blocked request from origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["X-Total-Count"],
  maxAge: 86400,
  optionsSuccessStatus: 204,
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Prevent clickjacking attacks
  res.setHeader("X-Frame-Options", "SAMEORIGIN");

  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Enable XSS protection in older browsers
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Referrer policy for privacy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  next();
};

// Preflight handler
const preflightHandler = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
};

module.exports = {
  corsMiddleware: cors(corsOptions),
  securityHeaders,
  preflightHandler,
};
