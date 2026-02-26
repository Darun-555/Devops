const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (err instanceof AppError) {
    return res.status(statusCode).json({
      success: false,
      message,
      data: {}
    });
  }

  return res.status(statusCode).json({
    success: false,
    message,
    data: {}
  });
};

module.exports = errorHandler;
