/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const AppError = require('./appError');
const User = require('../model/user');

const generateAccessToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN,
});
const generateRefreshToken = (id) => jwt.sign({ id }, process.env.REFRESH_JWT_SECRET, {
  expiresIn: process.env.REFRESH_JWT_EXPIRES_IN,
});

exports.createAndSendAccessJWTToken = async (
  user,
  statusCode,
  res,
  message,
) => {
  const token = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  const cookieOptions = {
    expiresIn: new Date(Date.now()
      + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    secure: false,
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }
  res.cookie('jwt', refreshToken, cookieOptions);
  user.save();
  res.status(statusCode).json({
    status: 'success',
    message,
    token,
    data: {
      user,
    },
  });
};

// exports.handleRefreshToken = async (
//   user,
//   statusCode,
//   res,
//   message,
// ) => {
//   const refreshToken = user.cookie;

//   if (!refreshToken) {
//     return ('error');
//   }

//   const decoded = await promisify(jwt.verify)(refreshToken, process.env.REFRESH_JWT_SECRET);
//   const dbUser = await User.findById(decoded.id);

//   const accessToken = generateRefreshToken(dbUser.id);
//   res.status(statusCode).json({
//     status: 'success',
//     message,
//     accessToken,
//     data: {
//       user,
//     },
//   });
// };

// eslint-disable-next-line consistent-return
