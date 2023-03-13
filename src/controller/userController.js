/* eslint-disable consistent-return */
const User = require('../model/user');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
// filters:
// by expiration date
// by name
// by type of plan

const filterObj = (obj, ...fields) => {
  let newObj = {};
  Object.keys(obj).forEach((el) => {
    if (fields.includes(el)) {
      newObj = obj[el];
    }
  });
  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('Não é possível editar a senha nessa rota', 400));
  }
  const filteredBody = filterObj(req.body, 'userName', 'password');
  const user = await User.findByIdAndUpdate(req.user.id, filterObj, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, { isActive: false });
  res.status(200).json({
    status: 'success',
    data: null,
  });
});

exports.index = async (req, res) => {
  // incluir ou não desativados

  try {
    const newUsers = await User
      .find()
      .sort('isActive');

    res.status(201).json({
      status: 'success',
      data: {
        results: newUsers.length,
        users: newUsers,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: `ocorreu um erro${error}`,
    });
  }
};

exports.createMe = async (req, res, next) => {
  try {
    const newUser = await User.create(req.body);
    const validateURL = `${req.protocol}://${req.get('host')}/api/v1/users/validateNewUser/${newUser.validateNewUserToken}`;
    const message = `clique no link abaixo para validação do seu acesso ao sistema: \n \n ${validateURL}`;

    await sendEmail({
      email: newUser.email,
      subject: 'Soliticação do acesso ao sistema',
      message,
    });
    res.status(200).json({
      status: 'success',
      message,
    });
  } catch (error) {
    res.status(400).json({
      message: error,
    });
  }
};
exports.show = catchAsync(async (req, res, next) => {
  const newUser = await User.findById(req.params.id);

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});

exports.update = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(400).json({
      message: error,
    });
  }
};
exports.destroy = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(400).json({
      message: error,
    });
  }
};

exports.destroyMany = async (req, res) => {
  try {
    const newUser = await User.deleteMany();

    res.status(201).json({
      status: 'success',
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    res.status(400).json({
      message: error,
    });
  }
};
