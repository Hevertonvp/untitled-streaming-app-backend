const express = require('express');

const router = express.Router();
const userController = require('../controller/userController');
const userStatsController = require('../controller/userStatsController');
const authController = require('../controller/authController');

router.post('/signUp', authController.signUp);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.delete('/', userController.destroyMany); // apagar
// protected routes:
router.use(authController.protect);
// global users routes:
router.patch('/updatePassword/', authController.updatePassword);
router.patch('/updateMe/', userController.updateMe);
router.delete('/deleteMe/', userController.deleteMe);
router.get('/:id', userController.show);

// guest routes:
router.post(
  '/guestBecomeSeller',
  authController.restrictTo('guest'),
  userController.guestBecomeSeller,
);

// seller routes:
router.use(authController.restrictTo('seller'));

router.get(
  '/salesStatsBySeller/',
  userStatsController.salesStatsBySeller,
);
router.get(
  '/salesDataBySeller/',
  authController.protect,
  userStatsController.salesStatsBySeller,

);

// admin routes:
router.use(authController.restrictTo('admin'));

router.put(
  '/:id',
  userController.update,
);
router.get(
  '/',
  userController.index,
);

// seller and admin routes:
router.use(authController.restrictTo('seller', 'admin'));

router.post(
  '/createCostumer',
  userController.createCostumer,
);
// router.patch('/validateByEmail/:token', authController.protect, authController.validateByEmail);

module.exports = router;
