/* eslint-disable no-unused-vars */
const moment = require('moment-timezone');
const Costumer = require('../model/costumer');

exports.index = async (req, res) => {
  // const queryObj = { ...req.query };
  // const excludedFields = ['page', 'sort', 'limit', 'fields'];
  //  excluding these field values to avoid if it passed as query parameters
  // excludedFields.forEach((el) => {
  //   delete queryObj[el];
  // });
  try {
    const costumers = await Costumer.find();

    res.status(201).json({
      status: 'success',
      data: {
        results: costumers.length,
        costumers,
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
      req.body.expirationDate = moment().add(7, 'days').calendar();
    }
    const costumer = await Costumer.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        costumer,
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
    const costumer = await Costumer.findById(req.params.id);

    res.status(201).json({
      status: 'success',
      data: {
        costumer,
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
    const costumer = await Costumer.findByIdAndUpdate(
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
        costumer,
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
    const costumer = await Costumer.findByIdAndDelete(req.params.id, {
      rawResult: true,
    });

    res.status(201).json({
      status: 'success',
      data: {
        costumer,
      },
    });
  } catch (error) {
    res.status(400).json({
      message: error,
    });
  }
};
