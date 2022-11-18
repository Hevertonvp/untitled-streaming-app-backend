const express = require('express');

const router = express.Router();

const costumerController = require('../controller/costumerController');

router.get('/', costumerController.index);
router.post('/', costumerController.store);
router.get('/:id', costumerController.show);
router.put('/:id', costumerController.update);
router.delete('/:id', costumerController.destroy);
router.delete('/', costumerController.destroyMany);

module.exports = router;
