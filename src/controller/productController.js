/* eslint-disable no-unused-vars */
const moment = require('moment-timezone');
const Product = require('../model/product');
const APIfeatures = require('../utils/api-features');

exports.index = async (req, res) => {
  const features = new APIfeatures(Product.find(), req.query)
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
    console.log(req.params.id);
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
    const newProduct = await Product.findByIdAndUpdate(
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
// manter apenas para admin ou excluir antes de enviar à produção?
exports.destroyMany = async (req, res) => {
  try {
    const product = await Product.deleteMany();

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
