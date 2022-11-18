const express = require('express');

const router = express.Router();

const sellerController = require('../controller/sellerController');

router.get('/', sellerController.index);
router.post('/', sellerController.store);
router.get('/:id', sellerController.show);
router.put('/:id', sellerController.update);
router.delete('/:id', sellerController.destroy);
router.delete('/', sellerController.destroyMany);

module.exports = router;
