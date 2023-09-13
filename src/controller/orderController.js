/* eslint-disable consistent-return */
const moment = require('moment');
const Order = require('../model/order');
const User = require('../model/user');
const TypeProduct = require('../model/typeProduct');
const ItemProduct = require('../model/itemProduct');
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
        { path: 'costumer', select: 'userName' },
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

exports.createSaleOrder = catchAsync(async (req, res, next) => {
  const costumerExists = await User.findById(req.body.costumer);
  // if you're not a seller, i'm the seller!
  const seller = req.user.role === 'guest'
    ? await User.findOne({ role: 'admin' }).select('_id')
    : req.user.id;

  if (!costumerExists) {
    return next(new AppError('cliente não encontrado, favor cadastrar novo cliente', 404));
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
      const item = await TypeProduct.findOne({
        _id: req.body.typeProducts[i].typeProductId,
      });
      if (!item) {
        throw new AppError('verifique se o tipo do produto foi cadastrado', 404);
      }
      // colocar no model?
      // aumentar a taxa para guests?
      // levar a função toda pra model, passar parametro role.
      const minimumValue = item.registrationPrice + (item.serviceFee * item.registrationPrice);

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
      costumer: req.body.costumer,
      seller,
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
