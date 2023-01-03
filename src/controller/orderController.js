/* eslint-disable no-await-in-loop */
/* eslint-disable no-inner-declarations */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
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
    const sellerExists = await Seller.findById(req.body.seller);
    if (!sellerExists) {
      throw new Error('vendedor não encontrado');
    }
    const costumerExists = await Costumer.findById(req.body.costumer);
    if (!costumerExists) {
      throw new Error('cliente não encontrado');
    }
    const handleItemProducts = async () => {
      const products = [];

      for (let i = 0; i < req.body.typeProducts.length; i++) {
        const item = await ItemProduct.find(
          {
            $and: [
              {
                'typeProduct': { $in: req.body.typeProducts[i].typeProductId },
              },
              {
                'isAvailable': { $eq: true },
              },
            ],
          },
        ).limit(req.body.typeProducts[i].qty);

        if (!item || item.length < req.body.typeProducts[i].qty) {
          throw new Error('verifique a quantidade de produtos no estoque');
        } else {
          products.push(...item); // change isAvailable
        }
      }
      return products;
    };

    const handleOrderPrice = async () => {
      const values = [];
      for (let i = 0; i < req.body.typeProducts.length; i++) {
        const item = await typeProduct.findById(
          req.body.typeProducts[i].typeProductId,
        );
        if (!item) {
          throw new Error('verifique se o tipo do produto foi cadastrado');
        }
        if (req.body.typeProducts[i].grossSellingPrice < (item.netRegisterPrice * 1.3)) {
          throw new Error('o valor de cada um dos produtos deve receber 30% de taxa de serviço'); // quantidade
        } else {
          values.push(req.body.typeProducts[i].grossSellingPrice
            * req.body.typeProducts[i].qty);
        }
      }
      return values.reduce((sum, curr) => {
        return sum + curr;
      }, 0);
    };

    const newOrder = await Order.create(
      {
        sellerId: req.body.seller,
        costumerId: req.body.costumer,
        itemProducts: await handleItemProducts(),
        orderPrice: await handleOrderPrice(),
        typeProducts: req.body.typeProducts,
      },

    );
    res.status(201).json({
      status: 'success',
      data: {
        newOrder,
      },
    });
  } catch (e) {
    res.status(400).json({
      message: `${e}`,
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
// $dateToString: { format: '%Y-%m-%d', date: '$createdAt'
// https://www.mongodb.com/docs/manual/reference/operator/aggregation/sum/
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
          localField: 'sellerId',
          foreignField: '_id',
          as: 'seller',
        },
      },
      {
        $match: { createdAt: { $gte: range.toDate() } },
      },
      { $addFields: { totalAmount: { $sum: '$orderPrice' } } }, // somar valor dos pedidos
      {
        $project: {
          createdAt: 1,
          totalAmount: 1,
          seller: { userName: 1, _id: 1 },
          itemProducts: {
            _id: 1,
            createdAt: 1,
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
