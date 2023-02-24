/* eslint-disable no-return-await */
/* eslint-disable object-shorthand */
/* eslint-disable consistent-return */
/* eslint-disable func-names */
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;
const userSchema = new Schema({
  userName: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'por favor, insira uma senha válida'],
    minLenght: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'por favor, confirme sua senha'],
    // only works with save and create
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'as senhas não são iguais',
    },
  },
  // needs implementation
  passwordChangedAt: Date,
  email: {
    type: String,
    required: [true, 'o campo email é obrigatório'],
    unique: [true,
      'O email informado já existe no banco de dados. por favor, tente realizar o login ou redefina sua senha'],
    lowercase: true,
    validate: [validator.isEmail, 'por favor, insira um email válido'],
  },
  phone: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'seller', 'costumer'],
    default: 'costumer',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
// received the token than changed the password?
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
const User = mongoose.model('User', userSchema);

module.exports = User;
