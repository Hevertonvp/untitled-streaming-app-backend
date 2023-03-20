const moment = require('moment');
const catchAsync = require('../utils/catchAsync');
const Order = require('./orderController');

exports.salesStats = catchAsync(async (req, res, next) => {
  let initialDate = moment().subtract(1, 'months'); // default

  if (req.query.range) {
    initialDate = moment().subtract((req.query.initialDate * 1 || 1), 'days');
  }
  const stats = await Order.aggregate([
    {
      $match: { createdAt: { $gte: initialDate.toDate() } },
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: 1 },
        success: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        canceled: { $sum: { $cond: [{ $eq: ['$status', 'canceled'] }, 1, 0] } },
        totalGrossAmount: { $sum: { $round: ['$orderAmount.grossValue', 2] } },
        totalAdmProfit: { $sum: { $round: ['$orderAmount.admProfit', 2] } },
      },
    },
    {
      $project: {
        _id: 0,
      },
    },

  ]);
  res.status(201).json({
    status: 'success',
    salesStatsByPeriod: stats,
  });
});

exports.sellerStats = catchAsync(async (req, res, next) => {
  let initialDate = moment().subtract(1, 'months'); // default

  if (req.query.range) {
    initialDate = moment().subtract((req.query.initialDate * 1 || 1), 'days');
  }
  const stats = await Order.aggregate([
    {
      $lookup:
          {
            from: 'users',
            localField: 'seller',
            foreignField: '_id',
            as: 'users',
          },
    },
    { $unwind: { path: '$users' } },

    {
      $group: {
        _id: ['$users.userName', '$users.role'],
        totalSales: { $sum: 1 },
        totalGrossAmount: { $sum: { $round: ['$orderAmount.grossValue', 2] } },
        sellerProfit: { $sum: { $round: ['$orderAmount.sellerProfit', 2] } },
        success: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        canceled: { $sum: { $cond: [{ $eq: ['$status', 'canceled'] }, 1, 0] } },
        lastSale: { $last: '$createdAt' },
      },
    },
    {
      $sort: {
        createdAt: 1,
      },
    },
  ]);
  res.status(201).json({
    status: 'success',
    results: stats.length,
    data: stats,
  });
});
exports.productsStats = catchAsync(async (req, res, next) => {
  let initialDate = moment().subtract(1, 'months'); // default

  if (req.query.range) {
    initialDate = moment().subtract((req.query.initialDate * 1 || 1), 'days');
  }

  const stats = await Order.aggregate([
    {
      $match: {
        status: 'pending', // change to success
      },
    },
    {
      $lookup:
          {
            from: 'typeproducts',
            localField: 'typeProducts.typeProductId',
            foreignField: '_id',
            as: 'products',
          },
    },
    {
      $unwind: { path: '$itemProducts' },
    },
    {
      $project: {
        productName: {
          $arrayElemAt: [
            {
              $filter: {
                input: '$products',
                as: 'product',
                cond: { $eq: ['$$product._id', '$itemProducts.typeProductId'] },
              },
            },
            0,
          ],
        },
        itemProducts: {
          typeProductId: 1,
        },
      },
    },
    {
      $group: {
        _id: '$itemProducts',
        total: { $sum: 1 },
        name: { $first: '$productName.name' },
      },
    },
    {
      $sort: {
        total: -1,
      },
    },
  ]);
  res.status(201).json({
    status: 'success',
    results: stats.length,
    data: stats,
  });
});
