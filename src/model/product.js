const mongoose = require('mongoose');
const moment = require('moment');

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  productPrice: {
    type: Number,
    required: true,
  },
  expirationDate: {
    type: Date,
    default: moment().add(1, 'year'), // for testing purposes
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  code: {
    type: Number,
    default: Math.random() * 100, // for testing purposes
    // make this private!
  },
  image: {
    type: String, // url
  },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
