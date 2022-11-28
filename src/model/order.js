const mongoose = require('mongoose');
const moment = require('moment');

const { Schema } = mongoose;

const OrderSchema = new Schema({
  createdAt: {
    type: Date,
    required: true,
    default: moment().toDate(),
  },
  seller: {
    type: Schema.Types.ObjectId,
    ref: 'Seller',
    required: true,
  },
  costumer: {
    type: Schema.Types.ObjectId,
    ref: 'Costumer',
    required: true,
  },
  products: [{
    type: Schema.Types.ObjectId,
    ref: 'Product',
  }],
  orderPrice: {
    type: Number,
  },
  itemProducts: [{
    type: Schema.Types.ObjectId,
    ref: 'itemProducts',
    required: true,
  }],
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
