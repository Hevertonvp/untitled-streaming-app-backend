const mongoose = require('mongoose');

const { Schema } = mongoose;

const OrderSchema = mongoose.Schema({
  createdAt: {
    type: Date,
    required: true,
  },
  seller: {
    type: Schema.Types.ObjectId,
    ref: 'Seller',
  },
  costumer: {
    type: Schema.Types.ObjectId,
    ref: 'Costumer',
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
  },
  admin: {
    type: Schema.Types.ObjectId,
    ref: 'Admin',
  },
});

const SalesRecord = mongoose.model('SalesRecord', OrderSchema);

module.exports = SalesRecord;
