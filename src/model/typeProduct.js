const mongoose = require('mongoose');

const { Schema } = mongoose;

const typeProductSchema = new Schema({
  itemProduct: { // count de disponiveis e indisponíveis
    type: Schema.Types.ObjectId,
    ref: 'ItemProduct',
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  image: {
    type: String, // url
  },
  registrationPrice: { // ADM = não será exibido, apenas informativo
    type: Number,
    default: 0,
  },
  serviceFee: { // valor revenda tve
    type: Number,
    default: 0.15,
  },
});

const Product = mongoose.model('TypeProduct', typeProductSchema);

module.exports = Product;
