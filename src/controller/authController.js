/* eslint-disable prefer-destructuring */
/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../model/user');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN,
});

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    phone: req.body.phone,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('verifique se o usuário e senha foram inseridos', 404));
  }
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('verifique o seu email e senha e tente novamente', 401));
  }
  const token = signToken(user._id);

  res.status(201).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('você precisa fazer login antes de realizar essa ação'));
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // check if the user still exists in the database
  const newUser = await User.findById(decoded.id);
  if (!newUser) {
    return next(new AppError('o usuário tentando acessar foi deletado', 401));
  }
  if (newUser.changePasswordAfter(decoded.iat)) {
    return next(new AppError('o usuário mudou a senha recentemente, por favor, faça login novamente', 401));
  }
  req.user = newUser; // req.user is the one that travels over middlewares
  next();
});

exports.restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('você não tem permissões necessárias para realizar esta ação', 403));
  }
  next();
};
