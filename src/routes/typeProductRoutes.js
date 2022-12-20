const express = require('express');

const router = express.Router();

const typeProductController = require('../controller/typeProductController');

router.get('/', typeProductController.index);
router.post('/', typeProductController.store);
router.get('/:id', typeProductController.show);
router.put('/:id', typeProductController.update);
router.delete('/:id', typeProductController.destroy);
router.delete('/', typeProductController.destroyMany);
module.exports = router;
