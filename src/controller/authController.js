/* eslint-disable prefer-destructuring */
/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const moment = require('moment');
const User = require('../model/user');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const createAndSendJWTToken = require('../utils/createAndSendJWT');

// a token sent just to verify the email address
const createAndSendFirstAccessToken = async (email) => {
  const firstAccessToken = crypto.randomBytes(3).toString('hex');
  const message = `Copie e cole o token abaixo para ter acesso ao sistema: \n\n ${firstAccessToken}`;

  // try {
  //   await sendEmail({
  //     email,
  //     subject: 'Soliticação do acesso',
  //     message,
  //   });
  // } catch (error) {
  //   return (new AppError('falha no envio do email do usuário.
  // tente novamente em alguns minutos', 500));
  // }
  return firstAccessToken;
};

exports.sendFirstAccessToken = catchAsync(async (req, res, next) => {
  const token = await createAndSendFirstAccessToken(req.body.email);
  const user = await User.findOne({ email: req.body.email });
  const tokenExpiresIn = moment().add(50, 'm').toDate();
  const message = `um token foi enviado para o email ${req.body.email},
  favor copiar e colar para finalizar o acesso.
  Seu token tem duração de 50 minutos,
  caso esse prazo se expire, será necessário realizar esse passo novamente.`;

  if (user) {
    if (user) {
      return next(new AppError('Usuário já existente no banco de dados', 401));
    }
    if (user.role === 'seller') {
      return next(new AppError('O usuário já tem acesso de vendedor, favor realizar o signIn', 401));
    }
    user.emailConfirmTokenExpires = tokenExpiresIn;
    user.emailConfirmToken = token;
    await user.save({ validateBeforeSave: false });
  }

  await User.create(
    {
      email: req.body.email,
      role: 'guest',
      emailConfirmToken: token,
      emailConfirmTokenExpires: tokenExpiresIn,
    },
  );
  res.status(200).json({
    status: 'success',
    message,
    data: token, // deletar
  });
});

exports.firstAccessWithToken = async (req, res, next) => {
  const guest = await User.findOne({ emailConfirmToken: req.body.token });
  if (!guest) {
    return next(new AppError(`Não foi possível encontrar o usuário.
    Verifique o token de acesso e tente novamente`, 404));
  }

  if (moment().toDate() > guest.emailConfirmTokenExpires) {
    return next(new AppError('seu token de acesso expirou, favor soliticar um novo token', 404));
  }
  const message = `seu acesso como visitante tem duração de 24 horas,
  após esse prazo, será necessária a solicitação de um novo token`;
  guest.emailIsValidated = true;
  guest.emailConfirmToken = undefined;
  guest.emailConfirmTokenExpires = undefined;
  const newGuest = await guest.save({ validateBeforeSave: false });
  await createAndSendJWTToken(newGuest, 200, res, message);
};

exports.signUp = async (req, res, next) => {
  const { user } = req;

  if (!user) {
    return next(new AppError('seu signIn temporário está expirado,favor, realize o signIn novamente'));
  }

  try {
    const newUser = await user.save();
    user.userName = req.body.userName;
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.phone = req.body.phone;
    user.role = 'costumer';
    createAndSendJWTToken(
      newUser,
      200,
      res,
      'success',
    );
  } catch (error) {
    return next(new AppError(error.message));
  }
};

exports.signIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('verifique se o usuário e senha foram inseridos', 404));
  }
  const user = await User.findOne({ email }).select('+password');
  console.log(user.password);
  if (
    !user
    || !(await user.correctPassword(password, user.password))
  ) {
    return next(new AppError('verifique o seu email e senha e tente novamente', 401));
  }
  createAndSendJWTToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('você precisa fazer signIn antes de realizar essa ação'));
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // check if the user still exists in the database
  const newUser = await User.findById(decoded.id);
  if (!newUser) {
    return next(new AppError('o usuário tentando acessar foi deletado', 401));
  }

  if (newUser.changePasswordAfter(decoded.iat)) {
    return next(new AppError('o usuário mudou a senha recentemente, por favor, faça signIn novamente', 401));
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
  if (!user || user.role === 'guest') {
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
  createAndSendJWTToken(user, 200, res);
});

exports.updatePassword = async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.passwordConfirm(req.body.passwordCurrent, user.password))) {
    next(new AppError('não foi possível encontrar o usuário com o email inserido', 401));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  createAndSendJWTToken(user, 200, res);
};
