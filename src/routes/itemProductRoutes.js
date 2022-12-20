const express = require('express');

const router = express.Router();

const itemProductController = require('../controller/itemProductController');

router.post('/', itemProductController.store);
router.get('/', itemProductController.index);
router.get('/stats', itemProductController.itemStats);

// router.get('/:id', costumerController.show);
// router.put('/:id', costumerController.update);
// router.delete('/:id', costumerController.destroy);
router.delete('/', itemProductController.destroyMany);
module.exports = router;
