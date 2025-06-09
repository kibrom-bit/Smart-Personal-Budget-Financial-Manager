const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/DashboardController');

// Route to get the dashboard
router.get('/', getDashboard);

module.exports = router;
