const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
  },
  expirationDate: {
    type: Date,
  },
  code: {
    type: String,
    unique: true,
    // make this private!
  },
  image: {
    type: String, // url
  },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
