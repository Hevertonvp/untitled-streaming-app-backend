const mongoose = require('mongoose');

const { Schema } = mongoose;

const SalesRecordSchema = mongoose.Schema({
  saleDate: {
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
});

const SalesRecord = mongoose.model('SalesRecord', SalesRecordSchema);

module.exports = SalesRecord;
