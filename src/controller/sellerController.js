const Seller = require('../model/seller');

// filters:
// by expiration date
// by name
// by type of plan

exports.index = async (req, res) => {
  try {
    const newSellers = await Seller.find();
    res.status(201).json({
      status: 'success',
      data: {
        sellers: newSellers,
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
    const newSeller = await Seller.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        seller: newSeller,
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
    const newSeller = await Seller.findById(req.params.id);

    res.status(201).json({
      status: 'success',
      data: {
        seller: newSeller,
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
    const newSeller = await Seller.findByIdAndUpdate(
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
        seller: newSeller,
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
    const newSeller = await Seller.findByIdAndDelete(req.params.id, {
      rawResult: true,
    });

    res.status(201).json({
      status: 'success',
      data: {
        seller: newSeller,
      },
    });
  } catch (error) {
    res.status(400).json({
      message: error,
    });
  }
};
