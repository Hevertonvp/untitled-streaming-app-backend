const User = require('../model/user');
const catchAsync = require('../utils/catchAsync');
// filters:
// by expiration date
// by name
// by type of plan

exports.index = async (req, res) => {
  // incluir ou não desativados

  try {
    const newUsers = await User
      .find()
      .sort('isActive');

    res.status(201).json({
      status: 'success',
      data: {
        results: newUsers.length,
        users: newUsers,
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
    const newUser = await User.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    res.status(400).json({
      message: error,
    });
  }
};
exports.show = catchAsync(async (req, res, next) => {
  const newUser = await User.findById(req.params.id);

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});

exports.update = async (req, res) => {
  try {
    const newUser = await User.findByIdAndUpdate(
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
        user: newUser,
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
    const newUser = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      {
        returnOriginal: false,
        runValidators: true,
      },
    );

    res.status(201).json({
      status: 'success',
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    res.status(400).json({
      message: error,
    });
  }
};

exports.destroyMany = async (req, res) => {
  try {
    const newUser = await User.deleteMany();

    res.status(201).json({
      status: 'success',
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    res.status(400).json({
      message: error,
    });
  }
};
