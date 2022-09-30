const express = require('express');

const router = express.Router();

const SalesRecordController = require('../controller/SalesRecordController');

router.get('/', SalesRecordController.index);
router.post('/', SalesRecordController.store);
router.get('/:id', SalesRecordController.show);
router.put('/:id', SalesRecordController.update);
router.delete('/:id', SalesRecordController.destroy);

module.exports = router;
