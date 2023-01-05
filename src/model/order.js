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
  typeProducts: [{
    typeProductId: { type: Schema.Types.ObjectId, ref: 'typeProduct' },
    qty: { type: Number, default: 1 },
  }],
  // alterar para objeto
  itemProducts: [{
    type: Object,
  }],
  // alterar para chave estrangeira  dado inútil?
  orderPrice: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'created', 'success', 'canceled'],
    default: 'pending',
  },
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
