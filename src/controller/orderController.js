/* eslint-disable no-underscore-dangle */
/* eslint-disable padded-blocks */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable no-multi-assign */
/* eslint-disable no-plusplus */
/* eslint-disable no-return-assign */
/* eslint-disable arrow-body-style */
/* eslint-disable radix */
/* eslint-disable quote-props */
/* eslint-disable no-unused-vars */
const moment = require('moment');
const Order = require('../model/order');
const Seller = require('../model/seller');
const typeProduct = require('../model/typeProduct');
const ItemProduct = require('../model/itemProduct');
const Costumer = require('../model/costumer');

const APIfeatures = require('../utils/api-features');

exports.index = async (req, res) => {
  try {
    const features = new APIfeatures(Order.find(), req.query)
      .filter()
      .sort()
      .limit()
      .paginate();
    const newOrder = await features.query;
    res.status(201).json({
      status: 'success',
      results: newOrder.length,
      data: {
        order: newOrder,
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

  try {

    const dbSeller = await Seller.findById(req.body.seller);
    const dbCostumer = await Costumer.findById(req.body.costumer);

    const dbItemProducts = await ItemProduct.find(
      {
        $and: [
          {
            'typeProduct': req.body.typeProduct.typeProductId,
          },
          {
            isAvailable: { $eq: true },
          },
        ],
      },
    ).limit(req.body.typeProduct.qty);

    console.log(dbItemProducts);
    const newOrder = await Order.create(
      {
        ...req.body,
        status: 'created',
      },
    );
    res.status(201).json({
      status: 'success',
      data: {
        order: newOrder,
      },
    });
  } catch (e) {
    res.status(400).json({
      message: `por favor, verifique o erro: ${e}`,
    });
  }
};
exports.show = async (req, res) => {
  try {
    const newOrder = await Order.findById(req.params.id);

    res.status(201).json({
      status: 'success',
      data: {
        newOrder,
      },
    });
  } catch (error) {
    res.status(400).json({
      message: error,
    });
  }
};
// dev-only
exports.destroyMany = async (req, res) => {
  try {
    const newOrder = await Order.deleteMany();

    res.status(201).json({
      status: 'success',
      data: {
        order: newOrder,
      },
    });
  } catch (error) {
    res.status(400).json({
      message: error,
    });
  }
};

exports.orderStats = async (req, res) => {
  let range = moment().subtract(1, 'months'); // default results from last month

  if (req.query.range) {
    range = moment().subtract((req.query.range * 1 || 1), 'days');
  }
  try {
    const stats = await Order.aggregate([

      {
        $lookup: {
          from: 'sellers',
          localField: 'seller',
          foreignField: '_id',
          as: 'seller',
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: 'products',
          foreignField: '_id',
          as: 'products',
        },

      },
      {
        $match: { createdAt: { $gte: range.toDate() } },
      },
      { $addFields: { orderValue: { $sum: '$products.productPrice' } } }, // somar valor dos pedidos
      {
        $project: {
          createdAt: 1,
          orderValue: 1,
          seller: { userName: 1, _id: 1 },
          products: {
            id: 1,
            name: 1,
            productPrice: 1,
            expirationDate: 1,
          },
        },
      },

      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);
    res.status(201).json({
      status: 'success',
      results: stats.length,
      orders: stats,
    });
  } catch (error) {
    res.status(400).json({
      message: error,
    });
  }
};
// e se o cara não tiver vendas?
exports.sellerStats = async (req, res) => {
  // the date range was defined in the request query
  try {
    const stats = await Order.aggregate([
      {
        $lookup: {
          from: 'sellers',
          localField: 'seller',
          foreignField: '_id',
          as: 'seller',
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: 'products',
          foreignField: '_id',
          as: 'products',
        },
      },
      {
        $project: {
          seller: {
            password: 0,
            __v: 0,
          },
        },
      },
      {
        $group: {
          _id: '$seller',
          totalSells: { $sum: 1 },
          lastSell: { $last: '$createdAt' },
          // add to get more sellers stats
        },
      },
      {
        $sort: {
          totalSells: -1,
        },
      },

    ]);
    res.status(201).json({
      status: 'success',
      results: stats.length,
      data: stats,
    });
  } catch (error) {
    res.status(400).json({
      message: error,
    });
  }
};
