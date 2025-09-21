const ApiError = require("../utils/apiError");

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message || "Internal Server Error",
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message || "Internal Server Error",
  });
};

const handleJwtInvalidSignature = () =>
  new ApiError("Invalid token Please log in again ....", 401);

const handleJwtExpired = () =>
  new ApiError("Your token has expired Please log in again ....", 401);

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "Error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    if (err.name === "JsonWebTokenError")
      err = handleJwtInvalidSignature();
    
    if (err.name === "TokenExpiredError")
      err = handleJwtExpired();

    sendErrorProd(err, res);
  }
};

module.exports = globalErrorHandler;
