const mongoose = require('mongoose');

const { Schema } = mongoose;

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
  trialExpirationDate: {
    type: Date,
  },
  salesRecord: {
    type: Schema.types.ObjectId,
    ref: 'SalesRecord',
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Costumer = mongoose.model('Costumer', costumerSchema);

module.exports = Costumer;
