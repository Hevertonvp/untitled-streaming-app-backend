const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const createAndSendToken = require('./authController');
const sendEmail = require('../utils/email');
const Guest = require('../model/guest');
const App = require('../model/guest');

// exports.loginGuest = catchAsync(async (req, res, next) => {
//   const guest = await Guest.find({ visitorLoginToken: req.body.token });
//   if (!guest) {
//     next(new AppError('token incorreto, favor, verifique a grafia e tente novamente', 401));
//   }
//   const message = `seu acesso como visitante tem duração de 24 horas,
//     após esse prazo, será necessária a solicitação de um novo token de acesso`;
// });

// exports.loginGuest = catchAsync(async (req, res, next) => {
//   const guest = await Guest.find({ visitorLoginToken: req.body.token });
//   if (!guest) {
//     next(new AppError('token incorreto, favor, verifique a grafia e tente novamente', 401));
//   }
//   const message = `seu acesso como visitante tem duração de 24 horas,
//     após esse prazo, será necessária a solicitação de um novo token de acesso`;
// });
