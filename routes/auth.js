const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const logout = require('../middlewares/logout');

router.get('/signup', authController.showRegisterForm);
router.post('/signup', authController.handleRegister);
router.get('/login', authController.showLoginForm);
router.post('/login', authController.handleLogin);
router.post('/send-code', authController.sendEmailCode);
router.post('/verify-code', authController.verifyEmailCode);;

router.get('/logout', logout.logout);


module.exports = router;
