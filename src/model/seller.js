/* eslint-disable no-return-await */
/* eslint-disable object-shorthand */
/* eslint-disable consistent-return */
/* eslint-disable func-names */
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;
const sellerSchema = new Schema({
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
  passwordChangedAt: Date,
  email: {
    type: String,
    required: [true, 'o campo Email é obrigatório'],
    unique: [true,
      'O email informado já existe no banco de dados. por favor, tente realizar o login ou redefina sua senha'],
    lowercase: true,
    validate: [validator.isEmail, 'por favor, insira um Email válido'],
  },
  phone: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

sellerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});

sellerSchema.methods.correctPassword = async function (candidatePassword, sellerPassword) {
  return await bcrypt.compare(candidatePassword, sellerPassword);
};

sellerSchema.methods.changePasswordAfter = function (JWTTimesstamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimesstamp < changedTimeStamp;
  }
  return false;
};
const Seller = mongoose.model('Seller', sellerSchema);

module.exports = Seller;
