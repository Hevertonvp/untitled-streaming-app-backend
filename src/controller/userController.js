/* eslint-disable prefer-const */
/* eslint-disable consistent-return */
const User = require('../model/user');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const factory = require('./factoryHandler');
const createAndSendJWTToken = require('../utils/createAndSendJWT');

const filterObj = (obj, ...fields) => {
  let newObj = {};
  Object.keys(obj).forEach((el) => {
    if (fields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

exports.show = catchAsync(async (req, res, next) => {
  const newUser = await User
    .findById(req.params.id)
    .select(
      {
        userName: 1,
        email: 1,
        phone: 1,
        role: 1,
        emailIsValidated: 1,
      },
    );

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});

exports.guestBecomeSeller = catchAsync(async (req, res, next) => {
  const { user } = req;
  if (!user) {
    return next(new AppError('seu login temporário está expirado,favor, realize o login novamente'));
  }

  // using save() to respect the validation rules
  user.userName = req.body.userName;
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.phone = req.body.phone;
  user.role = 'seller';
  const newUser = await user.save();
  createAndSendJWTToken(
    newUser,
    200,
    res,
    'success',
  );
});
exports.createCostumer = catchAsync(async (req, res, next) => {
  const { user } = req;
  if (!user) {
    return next(new AppError('sua sessão expirou, favor, realize o login novamente'));
  }
  const costumer = await User.create({
    userName: req.body.userName,
    phone: req.body.phone,
    email: req.body.email,
    role: 'costumer',
  });
  res.status(200).json({
    status: 'success',
    data: {
      costumer,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('Não é possível editar a senha nessa rota', 400));
  }
  const filteredBody = filterObj(
    req.body,
    'userName',
    'phone',
  );
  const user = await User.updateOne(
    req.user.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    },
  );
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { isActive: false },
  );
  res.status(200).json({
    status: 'success',
    data: null,
  });
});

exports.index = catchAsync(async (req, res, next) => {
  const docs = await User.find()
    .sort('createdAt');
  res.status(200).json({
    status: 'success',
    data: docs,
  });
});

exports.update = catchAsync(async (req, res) => {
  const newUser = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      returnOriginal: false,
      runValidators: true,
    },
  );

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});

exports.destroy = catchAsync(async (req, res) => {
  const newUser = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    {
      returnOriginal: false,
      runValidators: true,
    },
  );
  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});

exports.destroyMany = catchAsync(async (req, res) => {
  const newUser = await User.deleteMany();

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});
