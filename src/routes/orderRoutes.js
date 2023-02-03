const express = require('express');

const router = express.Router();

const OrderController = require('../controller/OrderController');

router.get('/', OrderController.index);
router.get('/sales-stats', OrderController.salesStats);
router.get('/sellers-stats', OrderController.sellersStats);
router.get('/products-stats', OrderController.productsStats);
router.post('/create', OrderController.store);
router.get('/:id', OrderController.show);
router.delete('/', OrderController.destroyMany);
module.exports = router;
