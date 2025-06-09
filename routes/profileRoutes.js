const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/profileController');

// Get Profile Route
router.get('/', getProfile);

// Update Profile Route
router.post('/update', updateProfile);

module.exports = router;
