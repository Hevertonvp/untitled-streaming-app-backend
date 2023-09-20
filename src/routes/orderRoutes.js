const express = require('express');

const router = express.Router();
const authController = require('../controller/authController');
const { authorization } = require('../middlewares/authorization');
const authentication = require('../middlewares/authentication');
const orderController = require('../controller/OrderController');
const orderStatsController = require('../controller/orderStatsController');

// sales statistics

router.use(authorization);
router.use(authentication('seller'));

router.get(
  '/',
  orderController.index,
);
router.use(authentication('admin'));

router.get(
  '/sales-stats',
  orderStatsController.salesStats,
);
router.get(
  '/sellers-stats',
  orderStatsController.sellerStats,
);
router.get(
  '/products-stats',
  orderStatsController.productsStats,
);

// sales management

router.post(
  '/createSaleOrder',
  orderController.createSaleOrder,
);

router.delete('/', orderController.destroyMany); // delete
module.exports = router;
