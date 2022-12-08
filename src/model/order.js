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
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    qty: { type: Number, default: 1 },
  }],
  orderPrice: {
    type: Number,
  },
  orderProducts: [{
    type: Object,
  }],
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
