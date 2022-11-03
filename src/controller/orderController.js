/* eslint-disable radix */
/* eslint-disable quote-props */
/* eslint-disable no-unused-vars */
const moment = require('moment');
const Order = require('../model/order');

const APIfeatures = require('../utils/api-features');

// exclusive to admin: // delete order // update order

// FILTERS:
// sorting by order price
// sorting by date of sale

// exports.aliasTopSellers = (req) => {
//   req.query.limit = '5';
// };

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
    const newOrder = await Order.create(req.body);
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
exports.update = async (req, res) => {
  try {
    const newOrder = await Order.findByIdAndUpdate(
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
        order: newOrder,
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
    const newOrder = await Order.findByIdAndDelete(req.params.id, {
      rawResult: true,
    });

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
  const startTime = moment().subtract(7, 'days');
  try {
    const stats = await Order.aggregate([

      {
        $lookup: {
          from: 'sellers',
          localField: 'sellerId',
          foreignField: '_id',
          as: 'sellerData',
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'productData',
        },

      },
      {
        $project: {
          createdAt: 1,
          sellerData: { userName: 1, _id: 1 },
          productData: {
            id: 1,
            name: 1,
            price: 1,
            expirationDate: 1,
          },
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
// e se o cara não tiver vendas?
exports.sellerStats = async (req, res) => {
  // the date range was defined in the request query
  try {
    let range = moment().subtract(1, 'months'); // default

    if (req.query.range) {
      range = moment().subtract((req.query.range * 1 || 1), 'days');
    }

    const stats = await Order.aggregate([
      {
        $lookup: {
          from: 'sellers',
          localField: 'sellerId',
          foreignField: '_id',
          as: 'sellerData',
        },
      },
      {
        $match: { createdAt: { $gte: range.toDate() } },
      },
      {
        $project: {
          sellerData: {
            password: 0,
            __v: 0,
          },

        },
      },
      {
        $group: {
          _id: ['$sellerData'],
          totalSells: { $sum: 1 },
          lastSell: { $last: '$createdAt' },
          // use here to get more of the sellers stats
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
