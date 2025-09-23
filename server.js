const path = require("path");

const express = require("express");

require("./utils/env");
const cors = require('cors')
const morgan = require("morgan"); 
const compression = require('compression')

const dbConnection = require("./config/database");
const globalErrorHandler = require("./middleware/errorMiddleware");
const ApiError = require("./utils/apiError");
const { webhookCheckoutHandler } = require("./services/orderServices")

const mountRoute = require("./routes/index")

// create a new express app instance and use express.json middleware to parse request bodies
const app = express();
/* -------------------------------- CORS -------------------------------- */
// ضع في .env مثلا:
// CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:5173,https://myapp.com
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map(o => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // السماح لطلبات أدوات مثل Postman (بدون origin)
      if (!origin) return cb(null, true);
      if (
        allowedOrigins.length === 0 || 
        allowedOrigins.includes(origin)
      ) {
        return cb(null, true);
      }
      return cb(new Error("CORS: Origin not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["X-Total-Count"],
    optionsSuccessStatus: 204
  })
);

// اختياري: تأكيد رد سريع على أي طلب OPTIONS لم تُغطِّه راوترات مخصّصة
app.use((req, res, next) => {
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});
/* ------------------------------ END CORS ------------------------------ */

// compress all responses
app.use(compression());

// checkout webhook
app.post('/webhook-checkout', express.raw({ type: 'application/json' }), webhookCheckoutHandler);


app.set('query parser', 'extended');
app.use(express.json());
app.use(express.static(path.join(__dirname, 'uploads')));


if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
} else if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

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
