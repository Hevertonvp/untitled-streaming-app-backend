/* eslint-disable prefer-arrow-callback */
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

const guestSchema = new Schema({

  password: String,
  email: {
    type: String,
    required: [true, 'o campo email é obrigatório! Ele é necessário para envio dos códigos adquiridos'],
    unique: [true,
      'O email informado já existe no banco de dados. por favor, tente realizar o login ou redefina sua senha'],
    lowercase: true,
    validate: [validator.isEmail, 'por favor, insira um email válido'],
  },
  phone: {
    type: String,
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
});

const Guest = mongoose.model('Guest', guestSchema);

module.exports = Guest;
