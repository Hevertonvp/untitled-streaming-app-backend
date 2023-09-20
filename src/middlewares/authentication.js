const AppError = require('../utils/appError');
/* eslint-disable consistent-return */

const authentication = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('você não tem permissões necessárias para realizar esta ação', 403));
  }
  next();
};

module.exports = authentication;
