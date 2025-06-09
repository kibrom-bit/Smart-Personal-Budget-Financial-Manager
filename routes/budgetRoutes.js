const express = require('express');
const router = express.Router();
const { setBudget, getBudget, viewBudgetOverview, editBudget, updateBudget  } = require('../controllers/budgetController');

// Route to set or update a budget for a specific user
router.post('/add/:month/:year', setBudget);
router.post('/edit', setBudget);
router.get('/addBudget/:month/:year', (req, res) => {
    res.render('addBudget', {
        month: req.params.month,
        year: req.params.year,
        errorMessage:null,
        successMessage:null
    });
});
router.post('/update/:id/:month/:year', updateBudget);

router.get('/edit/:id/:month/:year', editBudget);
// Route to get a user's budget
router.get('/:userId', getBudget);

// Route to view a user's budget overview (including expenses)
router.get('/overview/:userId/:year/:month', viewBudgetOverview);


module.exports = router;
