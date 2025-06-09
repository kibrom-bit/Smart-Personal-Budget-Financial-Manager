const express = require('express');
const router = express.Router();
const { addExpense, getExpenses, viewExpenses,editExpense,updateExpense} = require('../controllers/expenseController');
const db=require('../models/db');
// Route to add an expense
router.post('/add/:month/:year', addExpense);

// Route to get expenses for a user (returns in JSON format)
router.get('/get', getExpenses);
router.get('/addExpense/:month/:year', (req, res) => {
    res.render('addExpense',{
        month:req.params.month,
        year:req.params.year,
        errorMessage:null,
        successMessage:null});
});
router.post('/update/:id/:month/:year', updateExpense);
// Route to edit an expense
router.get('/update/:id/:month/:year', editExpense);
// Route to view expenses for a user for a specificyear and month
router.get('/:userId/:year/:month', viewExpenses);


module.exports = router;
