/* eslint-disable prefer-destructuring */
/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const Seller = require('../model/seller');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN,
});

exports.signup = catchAsync(async (req, res, next) => {
  const newSeller = await Seller.create({
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    phone: req.body.phone,
  });

  const token = signToken(newSeller._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      seller: newSeller,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('verifique se o usuário e senha estão corretos', 404));
  }
  const seller = await Seller.findOne({ email }).select('+password');

  if (!seller || !(await seller.correctPassword(password, seller.password))) {
    return next(new AppError('verifique o seu email e senha e tente novamente', 401));
  }
  const token = signToken(seller._id);

  res.status(201).json({
    status: 'success',
    token,
  });
});

exports.protectRoutes = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('você precisa fazer login antes de realizar essa ação'));
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const newSeller = await Seller.findById(decoded.id);
  if (!newSeller) {
    return next(new AppError('o usuário tentando acessar foi deletado', 401));
  }
  if (newSeller.changePasswordAfter(decoded.iat)) {
    return next(new AppError('o usuário mudou a senha recentemente, por favor, faça login novamente', 401));
  }
  req.seller = newSeller; // req.seller is the one that travels over middlewares
  next();
});
