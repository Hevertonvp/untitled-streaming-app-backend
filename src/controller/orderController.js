const Order = require('../model/order');

// exclusive to admin:
// delete order
// update order
// FILTERS:
// sorting by order price
// sorting by date of sale

exports.index = async (req, res) => {
  let queryObj = { ...req.query };
  const deletedFields = ['sort', 'page', 'limit', 'fields'];
  deletedFields.forEach((field) => {
    delete queryObj[field];
  });
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    queryObj = queryObj.sort(sortBy);
  } else {
    queryObj = queryObj.sort('-createdAt');
  }
  // limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    queryObj = queryObj.select(fields);
  } else {
    queryObj = queryObj.select('-__v');
  }
  try {
    const newOrder = await Order.find(queryObj);
    res.status(201).json({
      status: 'success',
      data: {
        order: newOrder, // everytime i see you falling...
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
    const neworder = await Order.findById(req.params.id);

    res.status(201).json({
      status: 'success',
      data: {
        order: neworder,
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
    const neworder = await Order.findByIdAndUpdate(
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
        order: neworder,
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
    const neworder = await Order.findByIdAndDelete(req.params.id, {
      rawResult: true,
    });

    res.status(201).json({
      status: 'success',
      data: {
        order: neworder,
      },
    });
  } catch (error) {
    res.status(400).json({
      message: error,
    });
  }
};
