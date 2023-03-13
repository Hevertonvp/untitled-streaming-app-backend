const express = require('express');

const router = express.Router();
const userController = require('../controller/userController');
const authController = require('../controller/authController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch('/validateNewUser/:token', authController.validateNewUser);
router.patch('/updatePassword/', authController.protect, authController.updatePassword);

router.patch('/updateMe/', authController.protect, userController.updateMe);
router.delete('/deleteMe/', authController.protect, userController.deleteMe);

router.get('/', userController.index);
router.get('/:id', userController.show);
router.put('/:id', userController.update);
router.delete('/:id', userController.destroy);
router.delete('/', userController.destroyMany);

module.exports = router;
