const mongoose = require('mongoose');

const { Schema } = mongoose;

const itemProductSchema = new Schema({
  typeProductId: {
    type: Schema.Types.ObjectId,
    ref: 'TypeProduct',
    required: true,
  },
  code: {
    type: Number,
    required: [
      true,
      'Code value is required',
    ],
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },

});
const ItemProduct = mongoose.model('ItemProduct', itemProductSchema);
module.exports = ItemProduct;
