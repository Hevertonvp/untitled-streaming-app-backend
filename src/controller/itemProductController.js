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
    const item = await ItemProduct.find();
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
