const express = require('express');
const router = express.Router();
const { loginUser, registerUser, resetPassword} = require('../controllers/userController');
const { errorMonitor } = require('nodemailer/lib/xoauth2');
const { logoutUser } = require('../controllers/userController');

// Logout route
router.get('/logout', logoutUser);
// User routes
router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/reset-password', resetPassword);
router.get('/reset-password', (req, res) => {
    res.render('reset', { message: null, error: null });
});
module.exports = router;
