/* eslint-disable no-unused-vars */
const moment = require('moment-timezone');
const typeProduct = require('../model/typeProduct');
const APIfeatures = require('../utils/api-features');

exports.index = async (req, res) => {
  const features = new APIfeatures(typeProduct.find(), req.query)
    .filter()
    .sort()
    .limit()
    .paginate();
  const products = await features.query;
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
  const product = await typeProduct.create(req.body);
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
    const product = await typeProduct.findById(req.params.id);

    res.status(201).json({
      status: 'success',
      data: {
        $project: {
          netRegisterPrice: 0,
          __v: 0,
        },
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
    const product = await typeProduct.findByIdAndUpdate(
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
    const newProduct = await typeProduct.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      {
        returnOriginal: false,
        runValidators: true,
      },
    );

    res.status(201).json({
      status: 'success',
      data: {
        seller: newProduct,
      },
    });
  } catch (error) {
    res.status(400).json({
      message: error,
    });
  }
};
exports.destroyMany = async (req, res) => {
  try {
    const product = await typeProduct.deleteMany();

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
