const mongoose = require('mongoose');

const { Schema } = mongoose;

const productSchema = new Schema({
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
  grossSellingPrice: { // valor revenda tve
    type: Number,
    required: true,
  },
  netRegisterPrice: { // não será exibido, apenas informativo
    type: Number,
    required: true,
  },

});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
