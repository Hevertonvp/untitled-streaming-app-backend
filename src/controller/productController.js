/* eslint-disable no-unused-vars */
const moment = require('moment-timezone');
const Product = require('../model/product');

exports.index = async (req, res) => {
  // ordem de preço

  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields']; //  excluding these field values to avoid if it passed as query parameters
  excludedFields.forEach((el) => {
    delete queryObj[el];
  });
  let queryString = JSON.stringify(queryObj);
  queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  let query = Product.find(JSON.parse(queryString), 'name');

  // SORTING
  if (req.query.sort) {
    query = query.sort(req.query.sort); // value passed in query sort
  }
  const products = await query;
  try {
    res.status(201).json({
      status: 'success',
      data: {
        results: products.length,
        products,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: `ocorreu um erro${error}`,
    });
  }
};

exports.store = async (req, res) => {
  const product = await Product.create(req.body);
  try {
    res.status(201).json({
      status: 'success',
      data: {
        product,
      },
    });
  } catch (error) {
    res.status(400).json({
      message: error,
    });
  }
};
exports.show = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    res.status(201).json({
      status: 'success',
      data: {
        product,
      },
    });
  } catch (error) {
    res.status(400).json({
      message: error,
    });
  }
};
exports.update = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        returnOriginal: false,
        runValidators: true,
      },
    );

    res.status(201).json({
      status: 'success',
      data: {
        product,
      },
    });
  } catch (error) {
    res.status(400).json({
      message: error,
    });
  }
};
exports.destroy = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id, {
      rawResult: true,
    });

    res.status(201).json({
      status: 'success',
      data: {
        Product: product,
      },
    });
  } catch (error) {
    res.status(400).json({
      message: error,
    });
  }
};
