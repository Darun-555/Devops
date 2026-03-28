const AppError = require('../utils/AppError');


const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;


  const isProduction = process.env.NODE_ENV === 'production';
  const message = (err instanceof AppError)
    ? err.message
    : isProduction
      ? 'Internal server error'
      : err.message;

  return res.status(statusCode).json({
    success: false,
    message,
    data: {}
  });
};

module.exports = errorHandler;
