const express = require('express');

const router = express.Router();
const userController = require('../controller/userController');
const authController = require('../controller/authController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.get('/', userController.index);
router.post('/', userController.store);
router.get('/:id', userController.show);
router.put('/:id', userController.update);
router.delete('/:id', userController.destroy);
router.delete('/', userController.destroyMany);

module.exports = router;
