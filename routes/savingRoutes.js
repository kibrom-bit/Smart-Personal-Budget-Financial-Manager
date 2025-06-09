const express = require('express');
const router = express.Router();
const { setSavingGoal, getSavings, trackSavings,updateSavings,editSavings } = require('../controllers/savingController');
const { render } = require('ejs');

// Route to set a saving goal
router.post('/add/:month/:year', setSavingGoal);
router.post('/update/:id/:month/:year', updateSavings);
router.get('/edit/:id/:month/:year',editSavings);
// Route to get savings for a user
router.get('/get', getSavings);

// Route to track savings for a user (based on userId, year, and month)
router.get('/track/:userId/:year/:month', trackSavings);

router.get('/addSaving/:month/:year', async (req, res) => {
    const { month, year } = req.params;
res.render('addSaving',{errorMessage:null,successMessage:null,month,year});
});

module.exports = router;
