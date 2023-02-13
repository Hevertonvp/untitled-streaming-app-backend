const AppError = require('../utils/appError');

const handleDbCastError = (err) => {
  const message = `invalid${err.path}: ${err}`;
  return new AppError(message, 404);
};
const handleDbDuplicatedFields = (err) => {
  const message = `duplicate field value, try a diferent value! ${err.path}: ${err}`;

  return new AppError(message, 404);
};
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      message: err.message,
      status: err.status,
    });
  } else {
    console.error('error', err);
    res.status(err.statusCode).json({
      message: 'something went wrong',
      status: 'error',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.assign(err);
    console.log(error);
    if (error.name === 'CastError') error = handleDbCastError(error);
    if (error.code === 11000) error = handleDbDuplicatedFields(error);

    sendErrorProd(error, res);
  }
};
