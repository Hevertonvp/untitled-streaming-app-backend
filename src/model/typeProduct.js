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
  image: {
    type: String, // url
  },
  netRegisterPrice: { // ADM = não será exibido, apenas informativo
    type: Number,
    default: 0,
  },
  grossSellingPrice: { // valor revenda tve
    type: Number,
    default: 0,
  },
});

const Product = mongoose.model('typeProduct', typeProductSchema);

module.exports = Product;
