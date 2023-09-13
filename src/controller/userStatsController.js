/* eslint-disable consistent-return */
const moment = require('moment');
const AppError = require('../utils/appError');
const User = require('../model/user');
const Order = require('../model/order');
const catchAsync = require('../utils/catchAsync');

exports.salesDataBySeller = catchAsync(async (req, res, next) => {
  console.log('passou');
  const sellerExists = await User.findById(req.user.id);

  if (!sellerExists) {
    return next(new AppError('realize o signIn novamente', 401));
  }
  const orders = await Order.find(
    { seller: req.user.id },
    {
      orderAmount: { admProfit: 0 },
      seller: 0,
      typeProducts: 0,
      itemProducts: 0,
    },
  )
    .populate([
      { path: 'costumer', select: 'userName' },
    ]);

  res.status(200).json({
    status: 'success',
    total: orders.length,
    data: orders,
  });
});

exports.salesStatsBySeller = catchAsync(async (req, res, next) => {
  let initialDate = moment().subtract(1, 'months'); // default
  if (req.query.range) {
    initialDate = moment().subtract((req.query.initialDate * 1 || 1), 'days');
  }
  const stats = await Order.aggregate([
    {
      $match: { createdAt: { $gte: initialDate.toDate() } },
    },
    { $match: { $expr: { $eq: ['$seller', { $toObjectId: req.user.id }] } } },
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
