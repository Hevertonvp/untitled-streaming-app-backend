const express = require('express');

const router = express.Router();
const authController = require('../controller/authController');
const OrderController = require('../controller/OrderController');

router.get('/', OrderController.index);
router.get('/sales-stats', authController.restrictTo('admin'), authController.protect, OrderController.salesStats);
router.get('/users-stats', OrderController.usersStats);
router.get('/products-stats', OrderController.productsStats);
router.post('/create', OrderController.store);
router.get('/:id', OrderController.show);
router.delete('/', OrderController.destroyMany);
module.exports = router;
