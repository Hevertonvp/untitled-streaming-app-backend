const mongoose = require('mongoose');
const moment = require('moment');

const { Schema } = mongoose;

const OrderSchema = mongoose.Schema({
  createdAt: {
    type: Date,
    required: true,
    default: moment().toDate(),
  },
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: 'Seller',
  },
  costumerId: {
    type: Schema.Types.ObjectId,
    ref: 'Costumer',
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
  },
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
