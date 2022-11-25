/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');

const { Schema } = mongoose;
const adminSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    sellers: [{
      type: Schema.Types.ObjectId,
      ref: 'Seller',
    }],
    costumers: [{
      type: Schema.Types.ObjectId,
      ref: 'Costumer',
    }],
    products: [{
      type: Schema.Types.ObjectId,
      ref: 'Product',
    }],
  },
  { timestamps: true },
);
const Admin = mongoose.Model('Admin', adminSchema);
module.exports = Admin;
