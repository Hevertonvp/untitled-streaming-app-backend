const express = require('express');

const router = express.Router();

const OrderController = require('../controller/OrderController');

router.get('/', OrderController.index);
router.get('/order-stats', OrderController.orderStats);
router.get('/seller-stats', OrderController.sellerStats);
router.post('/create', OrderController.store);
router.get('/:id', OrderController.show);
router.put('/:id', OrderController.update);
router.delete('/:id', OrderController.destroy);
module.exports = router;
