const express = require('express');

const router = express.Router();
const authController = require('../controller/authController');
const OrderController = require('../controller/OrderController');

router.get(
  '/',
  authController.protect,
  authController.checkUserIsValidated,
  OrderController.index,
);
router.get(
  '/sales-stats',
  authController.protect,
  authController.restrictTo('admin'),
  OrderController.salesStats,
);
router.get('/sellers-stats', OrderController.sellerStats);
router.get('/products-stats', OrderController.productsStats);
router.post('/create', OrderController.store);
router.get('/:id', OrderController.show);
router.delete('/', OrderController.destroyMany);
module.exports = router;
