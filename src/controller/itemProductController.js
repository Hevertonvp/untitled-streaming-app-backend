const ItemProduct = require('../model/itemProduct');

exports.store = async (req, res) => {
  try {
    const item = await ItemProduct.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        item,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: `ocorreu um erro${error}`,
    });
  }
};
exports.index = async (req, res) => {
  try {
    const itemProducts = await ItemProduct.find();
    res.status(201).json({
      status: 'success',
      results: itemProducts.lenght,
      data: {
        itemProducts,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: `ocorreu um erro${error}`,
    });
  }
};

exports.itemStats = async (req, res) => {
  try {
    const data = await ItemProduct.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'item-products',
        },
      },
      {
        $group: {
          _id: '$item-products',
          quantity: { $sum: 1 },
        },
      },
    ]);

    res.status(201).json({
      status: 'success',
      data: {
        data,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: `ocorreu um erro${error}`,
    });
  }
};
