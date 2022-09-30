const mongoose = require('mongoose');

const { Schema } = mongoose;
const sellerSchema = mongoose.Schema({
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
  },
  costumers: [{
    type: Schema.Types.ObjectId,
    ref: 'Costumer',
  }],
  products: [{
    type: Schema.Types.ObjectId,
    ref: 'Product',
  }],
  sales: [{
    type: Schema.Types.ObjectId,
    ref: 'SalesRecord',
  }],
});

const Seller = mongoose.model('Seller', sellerSchema);

module.exports = Seller;
