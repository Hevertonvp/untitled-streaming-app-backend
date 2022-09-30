const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
  },
  expirationTime: {
    type: Date,
    required: true,
  },
  code: {
    type: String,
    unique: true,
    // make this private!
  },
  image: {
    type: String, // url
    required: true,
  },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
