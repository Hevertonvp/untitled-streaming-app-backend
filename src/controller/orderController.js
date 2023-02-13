/* eslint-disable consistent-return */
const moment = require('moment');
const Order = require('../model/order');
const Seller = require('../model/seller');
const typeProduct = require('../model/typeProduct');
const ItemProduct = require('../model/itemProduct');
const Costumer = require('../model/costumer');
const APIfeatures = require('../utils/api-features');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.index = catchAsync(async (req, res, next) => {
  const features = new APIfeatures(
    Order.find(
      {},
      {
        itemProducts: 0,
        typeProducts: 0,
      },
    )
      .populate([
        { path: 'costumer', select: 'name' },
        { path: 'seller', select: 'userName' }]),
    req.query,
  )
    .filter()
    .sort()
    .limit()
    .paginate();

  const orders = await features.query;

  res.status(201).json({
    status: 'success',
    results: orders.length,
    orders,
  });
});

exports.store = catchAsync(async (req, res, next) => {
  const sellerExists = await Seller.findById(req.body.seller);
  if (!sellerExists) {
    return next(new AppError('vendedor não encontrado', 404));
  }
  const costumerExists = await Costumer.findById(req.body.costumer);
  if (!costumerExists) {
    return next(new AppError('cliente não encontrado', 404));
  }
  const handleItemProducts = async () => {
    const itemProducts = [];

    for (let i = 0; i < req.body.typeProducts.length; i++) {
      const item = await ItemProduct.find(
        {
          $and: [
            {
              typeProductId: { $in: req.body.typeProducts[i].typeProductId },
            },
            {
              isAvailable: { $eq: true },
            },
          ],
        },
      ).limit(req.body.typeProducts[i].qty);

      if (!item || item.length < req.body.typeProducts[i].qty) {
        throw new AppError('verifique a quantidade de planos em estoque', 404); // return was keeping the code running
      }
      itemProducts.push(...item);
    }
    return itemProducts;
  };
  const itemProducts = await handleItemProducts();

  const handleOrderAmount = async () => {
    const grossProductValues = [];
    const accServiceFee = [];
    const netProductValues = [];

    for (let i = 0; i < req.body.typeProducts.length; i++) {
      const item = await typeProduct.findOne({
        _id: req.body.typeProducts[i].typeProductId,
      });
      if (!item) {
        throw new AppError('verifique se o tipo do produto foi cadastrado', 404);
      }
      const minimumValue = item.registrationPrice + (item.serviceFee * 120);

      if (req.body.typeProducts[i].grossSellingPrice
          < minimumValue) {
        throw new AppError('o valor de cada um dos produtos deve receber o a taxa de serviço', 404);
      }
      accServiceFee.push(
        (req.body.typeProducts[i].grossSellingPrice
              * item.serviceFee)
            * req.body.typeProducts[i].qty,
      );
      grossProductValues.push(req.body.typeProducts[i].grossSellingPrice
             * req.body.typeProducts[i].qty);
      netProductValues.push((item.registrationPrice
            * req.body.typeProducts[i].qty));
    }
    return {
      grossValue: grossProductValues.reduce((crr, acc) => (crr + acc)),
      netValue: netProductValues.reduce((crr, acc) => (crr + acc)),
      admProfit: accServiceFee.reduce((crr, acc) => (crr + acc)),

    };
  };

  const {
    grossValue,
    netValue,
    admProfit,
  } = await handleOrderAmount();

  const newOrder = await Order.create(
    {
      seller: req.body.seller,
      costumer: req.body.costumer,
      itemProducts,
      orderAmount: {
        grossValue,
        sellerProfit: (grossValue - (netValue + admProfit)),
        admProfit,
      },
      typeProducts: req.body.typeProducts,
    },
  );
  const {
    createdAt,
    status,
    seller,
    costumer,
    orderAmount,
  } = newOrder;

  res.status(201).json({
    status: 'success',
    order: {
      createdAt,
      status,
      seller,
      costumer,
      orderAmount,
    },
  });
});

exports.show = catchAsync(async (req, res, next) => {
  const newOrder = await Order.findById(req.params.id);
  if (!newOrder) {
    return next(new AppError('não foi possivel encontrar o pedido'));
  }
  res.status(201).json({
    status: 'success',
    data: {
      newOrder,
    },
  });
});
exports.destroyMany = async (req, res, next) => {
  const newOrder = await Order.deleteMany();

  res.status(201).json({
    status: 'success',
    data: {
      order: newOrder,
    },
  });
};

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

exports.sellersStats = catchAsync(async (req, res, next) => {
  let initialDate = moment().subtract(1, 'months'); // default

  if (req.query.range) {
    initialDate = moment().subtract((req.query.initialDate * 1 || 1), 'days');
  }
  const stats = await Order.aggregate([
    {
      $lookup:
          {
            from: 'sellers',
            localField: 'seller',
            foreignField: '_id',
            as: 'sellers',
          },
    },
    { $unwind: { path: '$sellers' } },

    {
      $project: {
        status: 1,
        createdAt: 1,
        sellers: {
          userName: 1,
          _id: 1,
        },
        orderAmount: {
          grossValue: 1,
          sellerProfit: 1,
        },
        _id: 0,
      },
    },
    {
      $group: {
        _id: '$sellers.userName',
        totalSales: { $sum: 1 },
        totalGrossAmount: { $sum: { $round: ['$orderAmount.grossValue', 2] } },
        totalProfit: { $sum: { $round: ['$orderAmount.sellerProfit', 2] } },
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
