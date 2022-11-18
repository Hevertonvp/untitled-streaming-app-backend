const mongoose = require('mongoose');

// const { Schema } = mongoose;

const costumerSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isOnTrial: {
    type: Boolean,
    required: true,
    default: false,
  },
  expirationDate: {
    type: Date,
  },
  // products: [{ type: Schema.Types.ObjectId, ref: 'Product' }], //it doens't need this, right?
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Costumer = mongoose.model('Costumer', costumerSchema);

module.exports = Costumer;
