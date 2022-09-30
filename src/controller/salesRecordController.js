const SalesRecord = require('../model/SalesRecord');

// filters:
// by expiration date
// by name
// by type of plan

exports.index = async (req, res) => {
  try {
    const newSales = await SalesRecord.find();
    res.status(201).json({
      status: 'success',
      data: {
        sales: newSales,
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
    const newsales = await SalesRecord.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        sales: newsales,
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
    const newsales = await SalesRecord.findById(req.params.id);

    res.status(201).json({
      status: 'success',
      data: {
        sales: newsales,
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
    const newsales = await SalesRecord.findByIdAndUpdate(
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
        sales: newsales,
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
    const newsales = await SalesRecord.findByIdAndDelete(req.params.id, {
      rawResult: true,
    });

    res.status(201).json({
      status: 'success',
      data: {
        sales: newsales,
      },
    });
  } catch (error) {
    res.status(400).json({
      message: error,
    });
  }
};
