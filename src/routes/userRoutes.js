const express = require('express');

const router = express.Router();
const userController = require('../controller/userController');
const userStatsController = require('../controller/userStatsController');
const authController = require('../controller/authController');

// security
router.post('/signUp', authController.signUp);
router.post('/login', authController.login);
router.patch(
  '/guestBecomeSeller',
  authController.protect,
  authController.restrictTo('guest'),
  userController.guestBecomeSeller,
);
router.post(
  '/createCostumer',
  authController.protect,
  authController.restrictTo('seller', 'admin'),
  userController.createCostumer,
);
router.post('/guestLogin', authController.guestLogin);
router.post('/forgotPassword', authController.protect, authController.forgotPassword);
router.patch('/resetPassword/:token', authController.protect, authController.resetPassword);
// router.patch('/validateByEmail/:token', authController.protect, authController.validateByEmail);
router.patch('/updatePassword/', authController.protect, authController.updatePassword);

// for users interaction:
router.patch('/updateMe/', authController.protect, userController.updateMe);
router.delete('/deleteMe/', authController.protect, userController.deleteMe);
router.get('/:id', authController.protect, userController.show);

// admin only:
router.put(
  '/:id',
  authController.protect,
  authController.restrictTo('admin'),
  userController.update,
);
router.get(
  '/',
  authController.protect,
  authController.restrictTo('admin'),
  userController.index,
);

// sales statistics
router.get('/salesDataBySeller', authController.protect, userStatsController.salesDataBySeller); //
router.get('/salesStatsBySeller', authController.protect, userStatsController.salesStatsBySeller); //

// apagar
router.delete('/', userController.destroyMany); // apagar

module.exports = router;
