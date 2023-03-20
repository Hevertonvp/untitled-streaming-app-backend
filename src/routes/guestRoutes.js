const express = require('express');
const authController = require('../controller/authController');

const router = express.Router();

// login as a guest:
router.post('/createGuest', authController.createGuest);
router.post('/loginGuest', authController.loginGuest);
module.exports = router;
