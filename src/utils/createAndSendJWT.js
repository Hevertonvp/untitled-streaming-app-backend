/* eslint-disable no-underscore-dangle */
const jwt = require('jsonwebtoken');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN,
});

const createAndSendJWTToken = async (
  user,
  statusCode,
  res,
  message,
) => {
  const token = signToken(user._id);

  const cookieOptions = res.cookie('jwt', token, {
    expiresIn: new Date(Date.now()
      + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    secure: false,
    httpOnly: true,
  });
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }
  res.status(statusCode).json({
    status: 'success',
    message,
    token,
    data: {
      user,
    },
  });
};

module.exports = createAndSendJWTToken;
