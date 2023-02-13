const mongoose = require('mongoose');
const validator = require('validator');

const { Schema } = mongoose;
const sellerSchema = new Schema({
  userName: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'por favor, insira uma senha válida'],
    minLenght: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'por favor, confirme sua senha'],
  },
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

const Seller = mongoose.model('Seller', sellerSchema);

module.exports = Seller;
