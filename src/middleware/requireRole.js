const AppError = require('../utils/AppError');

const requireRole = (...roles) => (req, res, next) => {
  const user = req.user;

  if (!user || !user.role) {
    return next(new AppError('Unauthorized', 401));
  }

  if (!roles.includes(user.role)) {
    return next(new AppError('Forbidden', 403));
  }

  return next();
};

module.exports = requireRole;
