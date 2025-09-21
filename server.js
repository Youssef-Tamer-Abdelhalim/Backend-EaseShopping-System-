const path = require("path");

const express = require("express");

require("./utils/env");
const morgan = require("morgan"); 

const dbConnection = require("./config/database");
const globalErrorHandler = require("./middleware/errorMiddleware");
const ApiError = require("./utils/apiError");

const mountRoute = require("./routes/index")

// create a new express app instance and use express.json middleware to parse request bodies
const app = express();
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
  // استنى progress يخلص قبل ما تفتح الـ server


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
