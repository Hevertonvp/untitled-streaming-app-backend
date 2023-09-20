const express = require('express');

const router = express.Router();

const itemProductController = require('../controller/itemProductController');

router.post('/', itemProductController.store);
router.get('/', itemProductController.index);
router.get('/stats', itemProductController.itemStats);

router.delete('/', itemProductController.destroyMany);
module.exports = router;
