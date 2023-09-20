/* eslint-disable no-return-await */
/* eslint-disable object-shorthand */
/* eslint-disable consistent-return */
/* eslint-disable func-names */
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const moment = require('moment');
const sendEmail = require('../utils/email');
const AppError = require('../utils/appError');

const { Schema } = mongoose;
const userSchema = new Schema({
  userName: {
    type: String,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  // signIn token for guests:
  emailConfirmToken: String,
  emailConfirmTokenExpires: Date,

  email: {
    type: String,
    unique: [true, 'O email já existe no banco de dados'],
    lowercase: true,
    validate: [validator.isEmail, 'por favor, insira um email válido'],
    required: [true, `por favor, insira um email válido. Verifique se o email
    é correto, pois o código será enviado no email informado`],
  },
  phone: {
    type: String,
    required: [function () { return this.role !== 'guest'; },
      'é obrigatório o teledone'],
  },
  role: {
    type: String,
    enum: ['admin', 'seller', 'costumer', 'guest'],
    default: 'guest',
    validate: {
      validator: function (el) {
        return el !== 'admin';
      },
      message: 'permissão negada',
    },
  },
  password: {
    type: String,
    minLenght: 8,
    select: false,
    required: function () { return this.role !== 'guest'; },
  },
  passwordConfirm: {
    type: String,
    select: false,
    required: function () { return this.role !== 'guest'; },
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'As senhas não são iguais',
    },
  },

  isActive: {
    type: Boolean,
    default: true,
    select: false,
  },
  emailIsValidated: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    required: true,
    default: moment().toDate(),
  },
  refreshToken: String,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});
// change it to middleware
userSchema.pre('updateOne', async function (next) {
  if (!this.get('role') === 'admin') return next('Não autorizado');
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.role === 'guest') return next();

  this.passwordChangedAt = Date.now() - 2000;
  return next();
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
// check if the user has changed his password and in this case, a new token must be provided
userSchema.methods.changePasswordAfter = function (JWTTimesstamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );

    return JWTTimesstamp < changedTimeStamp;
  }
  return false;
};
// creates a new token for the reset password process.
// the hashed version of the token will be stored, the non-hashed will be sended to the user.
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = moment().add(1, 'days');
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
