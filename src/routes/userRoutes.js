const express = require('express');

const router = express.Router();

const { authorization } = require('../middlewares/authorization');
const authentication = require('../middlewares/authentication');
const userController = require('../controller/userController');
const userStatsController = require('../controller/userStatsController');
const authController = require('../controller/authController');

router.post('/send-email-token', authController.sendEmailAccessToken);
router.post('/token-access', authController.firstTokenAccess);
router.post('/sign-in', authController.signIn);
router.patch('/reset-password/:token', authController.resetPassword);
router.post('/forgot-password', authController.forgotPassword);

router.post('/refresh-Token', authController.refreshToken);
router.delete('/', userController.destroyMany); // apagar
// authorizationed routes:
router.use(authorization);

// global users routes:
router.patch('/update-password/', authController.updatePassword);
router.patch('/update-me/', userController.updateMe);
router.delete('/delete-me/', userController.deleteMe);
router.get('/:id', userController.show);

router.post('/sign-out/', authController.signOut);
// guest routes:
router.post('/sign-up', authController.signUp);
router.use(authentication('guest'));

// seller routes:
router.use(authentication('seller'));

router.get(
  '/seller-stats/',
  userStatsController.salesStatsBySeller,
);
router.get(
  '/sales-data/',
  userStatsController.salesStatsBySeller,

);

// admin routes:
router.use(authentication('seller, costumer')); // test

router.put(
  '/:id',
  userController.update,
);
router.get(
  '/',
  userController.index,
);

// seller and admin routes:
router.use(authentication('seller', 'admin'));

router.post(
  '/create-costumer',
  userController.createCostumer,
);

module.exports = router;
