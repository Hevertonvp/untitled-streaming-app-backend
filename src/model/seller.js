const mongoose = require('mongoose');

const { Schema } = mongoose;
const sellerSchema = Schema({
  userName: {
    type: String,
    required: [true, 'must have a valid name'],
  },
  password: {
    type: String,
    required: [true, 'must have a valid password'],
  },
  email: {
    type: String,
    required: [true, 'must have a valid email address'],
    unique: true,
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
