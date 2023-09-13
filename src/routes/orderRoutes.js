const express = require('express');

const router = express.Router();
const authController = require('../controller/authController');
const orderController = require('../controller/OrderController');
const orderStatsController = require('../controller/orderStatsController');

// sales statistics
router.get(
  '/',
  authController.protect,
  authController.restrictTo('seller'),
  orderController.index,
);
router.get(
  '/sales-stats',
  authController.protect,
  authController.restrictTo('admin'),
  orderStatsController.salesStats,
);
router.get(
  '/sellers-stats',
  authController.protect,
  authController.restrictTo('admin'),
  orderStatsController.sellerStats,
);
router.get(
  '/products-stats',
  authController.protect,
  authController.restrictTo('admin'),
  orderStatsController.productsStats,
);

// sales management

router.post(
  '/createSaleOrder',
  authController.protect,
  orderController.createSaleOrder,
);

// created by visitor?

router.delete('/', orderController.destroyMany); // delete
module.exports = router;
