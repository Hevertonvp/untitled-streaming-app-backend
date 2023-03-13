/* eslint-disable prefer-destructuring */
/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../model/user');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN,
});

const createAndSendToken = (
  user,
  statusCode,
  res,
  message,
) => {
  const token = signToken(user._id);
  const cookieOptions = res.cookie('jwt', token, {
    expires: new Date(Date.now()
      + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    secure: false,
    httpOnly: true,
  });
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    message,
    token,
    data: {
      user,
    },
  });
};

const sendValidationEmail = async (user, req) => {
  const validateURL = `${req.protocol}://${req.get('host')}/api/v1/users/validateNewUser/${user.validateNewUserToken}`;
  const message = `clique no link abaixo para validação do seu acesso ao sistema: \n \n ${validateURL}`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Soliticação do acesso ao sistema',
      message,
    });
  } catch (error) {
    return (new AppError('falha no envio do email do usuário. tente novamente em alguns minutos', 500));
  }
};

// test
exports.validateNewUser = async (req, res, next) => {
  const user = await User.findOne({ validateNewUserToken: req.params.token });
  if (!user) {
    return next(new AppError('não foi possível realizar a validação do usuário', 500));
  }
  user.emailIsValidated = true;
  user.validateNewUserToken = undefined;
  await user.save({ validateBeforeSave: false });
  res.status(201).json({
    status: 'success',
    message: 'Usuário validado com sucesso',
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    userName: req.body.userName,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    phone: req.body.phone,
    role: req.body.role,
  });
  const emailMessage = 'favor, verifique o email cadastrado para poder realizar compras e vendas no sistema';
  await sendValidationEmail(newUser, req);
  createAndSendToken(newUser, 200, res, emailMessage);
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
  createAndSendToken(user, 200, res);
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

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('não existe usuário com o email informado', 404));
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Não se lembra da senha? solicite o reset de senha aqui: ${resetURL}. \n Caso não tenha solicitado o reset de senha, por favor,
  desconsidere essa mensagem`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Seu token de reset de senha é válido por 10 minutos',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token para reset de senha enviado solicitado',
    });
  } catch (error) {
    user.password = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('houve um erro ao enviar o email para reset de senha'), 500);
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gte: Date.now() },
  });
  if (!user) {
    return next(new AppError('Seu token de acesso é invalido ou expirou, favor solicite novamente', 500));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  createAndSendToken(user, 200, res);
});
exports.checkUserIsValidated = catchAsync(async (req, res, next) => {
  if (!req.user.email) {
    await sendValidationEmail(req.user, req);
    return next(
      new AppError(
        `por favor, verifique a confirmação de acesso
        que foi enviada ao seu email antes de realizar esta ação.`,
        401,
      ),
    );
  }
  next();
});
exports.updatePassword = async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.passwordConfirm(req.body.passwordCurrent, user.password))) {
    next(new AppError('não foi possível encontrar o usuário com o email inserido', 401));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  createAndSendToken(user, 200, res);
};
