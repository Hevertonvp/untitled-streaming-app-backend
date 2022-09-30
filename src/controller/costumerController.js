/* eslint-disable no-unused-vars */
const moment = require('moment-timezone');
const Costumer = require('../model/costumer');

exports.index = async (req, res) => {
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields']; //  excluding special field names to avoid collisions
  excludedFields.forEach((el) => {
    delete queryObj[el];
  });
  try {
    const newCostumers = Costumer.find(queryObj);

    res.status(201).json({
      status: 'success',
      data: {
        results: newCostumers.length,
        Costumers: newCostumers,
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
    if (req.body.isOnTrial) { // new costumers have 7 days to register
      req.body.trialExpirationDate = moment().add(7, 'days').calendar();
    }
    const newCostumer = await Costumer.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        Costumer: newCostumer,
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
    const newCostumer = await Costumer.findById(req.params.id);

    res.status(201).json({
      status: 'success',
      data: {
        Costumer: newCostumer,
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
    const newCostumer = await Costumer.findByIdAndUpdate(
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
        Costumer: newCostumer,
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
    const newCostumer = await Costumer.findByIdAndDelete(req.params.id, {
      rawResult: true,
    });

    res.status(201).json({
      status: 'success',
      data: {
        Costumer: newCostumer,
      },
    });
  } catch (error) {
    res.status(400).json({
      message: error,
    });
  }
};
