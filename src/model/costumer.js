const mongoose = require('mongoose');

const costumerSchema = mongoose.Schema({
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
  },
  isOnTrial: {
    type: Boolean,
    required: true,
  },
  expirationDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Costumer = mongoose.model('Costumer', costumerSchema);

module.exports = Costumer;
