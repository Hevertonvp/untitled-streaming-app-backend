/* eslint-disable prefer-destructuring *//* eslint-disable prefer-destructuring */
/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const moment = require('moment');
const User = require('../model/user');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const createAndSendJWTTokenToken = require('../utils/createAndSendJWTToken');

exports.authorization = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('você precisa fazer signIn antes de realizar essa ação'));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // check if the user exists
  const dbUser = await User.findById(decoded.id);

  if (!dbUser) {
    return next(new AppError('o usuário tentando acessar foi deletado', 401));
  }

  if (!dbUser && dbUser.changePasswordAfter(decoded.iat)) {
    return next(new AppError('o usuário mudou a senha recentemente, por favor, faça signIn novamente', 403));
  }

  req.user = dbUser;

  next();
});
