const express = require('express');

const router = express.Router();

const productController = require('../controller/productController');

router.get('/', productController.index);
router.post('/create', productController.store);
router.get('/:id', productController.show);
router.put('/update/:id', productController.update);
router.delete('/:id', productController.destroy);

module.exports = router;
