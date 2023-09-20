/* eslint-disable prefer-destructuring */
/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const moment = require('moment');
const User = require('../model/user');
const generateAccessToken = require('../utils/createAndSendJWTToken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const { createAndSendAccessJWTToken } = require('../utils/createAndSendJWTToken');
const { handleRefreshToken } = require('../utils/createAndSendJWTToken');

// this method sends a token just to verify the email address.
const createEmailAccessToken = async (email) => {
  const emailToken = crypto.randomBytes(3).toString('hex');
  const message = `Copie e cole o token abaixo para ter acesso ao sistema: \n\n ${emailToken}`;

  if (process.env.NODE_ENV === 'production') {
    try {
      await sendEmail({
        email,
        subject: 'Soliticação do acesso',
        message,
      });
    } catch (error) {
      return (new AppError(`falha no envio do email do usuário.
      tente novamente em alguns minutos`, 500));
    }
  } else return emailToken;
};

exports.sendEmailAccessToken = catchAsync(async (req, res, next) => {
  const token = await createEmailAccessToken(req.body.email);
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
    data: token,
  });
});

exports.firstTokenAccess = async (req, res, next) => {
  const guest = await User.findOne({ emailConfirmToken: req.body.token });

  if (!guest) {
    return next(new AppError(`Não foi possível encontrar o usuário.
    Solicite seu token de acesso`, 404));
  }

  if (moment().toDate() > guest.emailConfirmTokenExpires) {
    return next(new AppError('seu token de acesso expirou, favor soliticar um novo token', 404));
  }
  const message = `seu acesso como visitante tem duração de 24 horas,
  após esse prazo, será necessária a solicitação de um novo token`;
  guest.emailIsValidated = true;
  guest.emailConfirmToken = undefined;
  guest.emailConfirmTokenExpires = undefined;
  const user = await guest.save({ validateBeforeSave: false });
  createAndSendAccessJWTToken(
    user,
    200,
    res,
    'success',
  );
};

exports.signUp = async (req, res, next) => {
  const { user } = req;
  if (!user) {
    return next(new AppError('seu signIn temporário está expirado,favor, realize o signIn novamente'));
  }

  try {
    user.userName = req.body.userName;
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.phone = req.body.phone;
    user.role = 'costumer';
    await user.save();
  } catch (error) {
    return next(new AppError(error.message));
  }
  res.status(200).json({
    data: user.userName,
    message: 'usuário criado com sucesso',
  });
};

exports.signIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('verifique se o usuário e senha foram inseridos', 404));
  }
  const user = await User.findOne({ email }).select('+password');

  if (
    !user
    || !(await user.correctPassword(password, user.password))
  ) {
    return next(new AppError('verifique o seu email e senha e tente novamente', 401));
  }
  createAndSendAccessJWTToken(user, 200, res);
});

exports.signOut = async (req, res, next) => {
  // on client, delete the accessToken

  if (!req.cookies?.jwt) return next(new AppError('não foi possível deslogar do sistema', 403));
  const refreshToken = req.cookies.jwt;
  const dbUser = await User.findOne({ refreshToken });
  const cookieOptions = {
    expiresIn: new Date(Date.now()
      + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    secure: false,
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }
  if (!dbUser) {
    res.clearCookie('jwt', cookieOptions);
    return next(new AppError('usuário não possui um token válido', 403));
  }
  res.clearCookie('jwt', cookieOptions);
  dbUser.refreshToken = undefined;
  dbUser.save();
  res.status(200).json({ success: true });
};

exports.restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('você não tem permissões necessárias para realizar esta ação', 403));
  }

  next();
};

exports.refreshToken = (async (req, res, next) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return next(new AppError('usuário necessita logar no sistema', 401));
  const refreshToken = req.cookies.jwt;
  const decoded = await promisify(jwt.verify)(refreshToken, process.env.REFRESH_JWT_SECRET);

  const dbUser = await User.findById(decoded.id);

  if (!dbUser) return next(new AppError('usuário não autorizado', 401));

  const token = jwt.sign(
    { id: dbUser.id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN },
  );
  res.status(200).json({
    token,
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || user.role === 'guest') {
    return next(AppError('não existe usuário com o email informado', 404));
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
  createAndSendAccessJWTToken(user, 200, res);
});

exports.updatePassword = async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.passwordConfirm(req.body.passwordCurrent, user.password))) {
    next(new AppError('não foi possível encontrar o usuário com o email inserido', 401));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  createAndSendAccessJWTToken(user, 200, res);
};
