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
  typeProducts: [{ // required?
    typeProductId: {
      type: Schema.Types.ObjectId,
      ref: 'TypeProduct',
    },
    qty: { type: Number, default: 1 },
  }],
  itemProducts: [{
    typeProductId: {
      type: Schema.Types.ObjectId,
      ref: 'ItemProduct',
    },
  }],
  orderAmount: {
    grossValue: {
      type: Number, default: 0,
    },
    sellerProfit: {
      type: Number, default: 0,
    },
    admProfit: {
      type: Number, default: 0,
    },
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'canceled'],
    default: 'pending',
  },
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
