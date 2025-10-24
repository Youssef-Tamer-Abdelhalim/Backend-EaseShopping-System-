const cors = require("cors");
const ApiError = require("../utils/apiError");

// Parse allowed origins from environment variable
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

// Public endpoints that don't require origin validation (webhooks, health checks)
const publicEndpoints = ["/webhook-checkout", "/health"];

// CORS configuration
const corsOptions = {
  origin: (origin, cb) => {
    const { req } = cb;
    const requestPath = req && req.path ? req.path : "";

    // 1) Allow public endpoints (webhooks) without origin
    if (!origin && publicEndpoints.includes(requestPath)) {
      return cb(null, true);
    }

    // 2) In development mode: allow requests without origin (Postman, cURL, etc.)
    if (!origin && process.env.NODE_ENV === "development") {
      return cb(null, true);
    }

    // 3) In production mode: reject requests without origin (security)
    if (!origin && process.env.NODE_ENV === "production") {
      return cb(new ApiError("Origin header is required", 403), false);
    }

    // 4) Check if CORS_ORIGINS is configured
    if (allowedOrigins.length === 0) {
      // Fallback: In development, allow localhost only
      if (
        process.env.NODE_ENV === "development" &&
        origin &&
        origin.includes("localhost")
      ) {
        return cb(null, true);
      }
      // In production: reject if not configured
      console.error(
        "⚠️  CORS_ORIGINS not configured! Please set it in .env file"
      );
      return cb(new ApiError("CORS configuration error", 500), false);
    }

    // 5) Validate origin against allowed list
    if (allowedOrigins.includes(origin)) {
      return cb(null, true);
    }

    // 6) Log and reject unauthorized origins
    console.warn(`🚫 CORS blocked request from origin: ${origin}`);
    return cb(new ApiError(`Origin '${origin}' is not allowed`, 403), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["X-Total-Count"],
  maxAge: 86400, // Cache preflight requests for 24 hours
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
