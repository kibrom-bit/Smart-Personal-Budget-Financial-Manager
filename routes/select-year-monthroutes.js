const express = require('express');
const router = express.Router();
const db = require('../models/db'); // Import the database connection

// Route for selecting year and month
router.post('/', async (req, res) => {
    let { year, month } = req.body; // Get selected year and month
    if (!req.session.user) {
        return res.redirect('/login'); // Redirect to login if no session
    }
    const userId = req.session.user.id; // Assuming you store user info in session

    // Convert 'year' and 'month' to integers if they are strings or arrays
    year = parseInt(year, 10);
    month = parseInt(month, 10);

    // Ensure 'year' and 'month' are valid numbers
    if (isNaN(year) || isNaN(month)) {
        return res.status(400).send("Invalid year or month input");
    }

    // Corrected queries for expenses, budgets, and savings for the selected year and month
    const queryExpenses = `SELECT * FROM expenses WHERE user_id = $1 AND year = $2 AND month = $3`;
    const queryBudgets = `SELECT * FROM budgets WHERE user_id = $1 AND year = $2 AND month = $3`;
    const querySavings = `SELECT * FROM savings WHERE user_id = $1 AND year = $2 AND month = $3`;

    try {
        // Execute the queries concurrently using db.query()
        const expensesResults = await db.query(queryExpenses, [userId, year, month]);
        const budgetsResults = await db.query(queryBudgets, [userId, year, month]);
        const savingsResults = await db.query(querySavings, [userId, year, month]);

        // If no results are found, return empty arrays
        const expenses = expensesResults.rows.length > 0 ? expensesResults.rows : [];
        const budgets = budgetsResults.rows.length > 0 ? budgetsResults.rows : [];
        const savings = savingsResults.rows.length > 0 ? savingsResults.rows : [];

        // Render the dashboard with the filtered data
        res.render('Dashboard', {
            expenses,
            budgets,
            savings,
            selectedYear: year,
            selectedMonth: month,
            year,
            month
        });
    } catch (err) {
        console.error("Error fetching data:", err);
        return res.status(500).send("Internal Server Error");
    } 
});

module.exports = router;
