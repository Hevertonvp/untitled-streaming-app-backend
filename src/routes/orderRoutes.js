const express = require('express');

const router = express.Router();
const authController = require('../controller/authController');
const orderController = require('../controller/OrderController');
const orderStatsController = require('../controller/orderStatsController');

// sales statistics
router.get(
  '/',
  authController.protect,
  authController.restrictTo('admin'),
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

router.get(
  '/fastSale',
  authController.guestProtect,
  orderController.fastSale,
);

// sales management

router.post(
  '/createBySeller',
  authController.protect,
  authController.restrictTo('seller'),
  orderController.createBySeller,
);

// created by visitor?

router.delete('/', orderController.destroyMany); // delete
module.exports = router;
