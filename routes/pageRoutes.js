const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Routes for user actions
router.get('/', (req, res) => res.render('index', { message: 'Smart Financial Manager is running!' ,error:null})); // Welcome page
router.get('/register', (req, res) => res.render('register', { message: null, error: null })); // Registration page
router.get('/login', (req, res) => res.render('login', { message: null, error: null })); // Login page
router.get('/reset-password', (req, res) => res.render('reset',{ message: null, error: null })); // Password reset page
router.get('/select-year-month', (req, res) => res.render('select-year-month', { message: null, error: null })); // Year and month selection page
// router.get('/profile', (req, res) => {
//     if (!req.session.user) {
//         return res.redirect('/login');
//     }
//     const user = req.session.user;
//     res.render('profile', { user });
// });

module.exports = router;
