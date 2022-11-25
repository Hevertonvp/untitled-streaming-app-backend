const mongoose = require('mongoose');
const moment = require('moment');

const { Schema } = mongoose;

const costumerSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isOnTrial: {
    type: Boolean,
    required: true,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  expirationDate: {
    type: Date,
    default: moment().add(1, 'year'), // for testing purposes
  },
});

const Costumer = mongoose.model('Costumer', costumerSchema);

module.exports = Costumer;
