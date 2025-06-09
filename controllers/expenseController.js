const db = require("../models/db");

// Add an expense for the user
exports.addExpense = async (req, res) => {
  let { category, amount, reason, month, year } = req.body;
  if (!req.session.user) {
    return res.redirect("/login"); // Redirect to login if no session
  }
  const user_id = req.session.user.id;
  const expense = { category, amount, reason, month, year };
  try {
    // Parse and normalize year and month
    year = parseInt(year, 10); // Ensure the year is an integer
    month = month.trim().toLowerCase(); // Normalize month to lowercase

    if (!Number.isInteger(year)) {
      return res.status(400).send("Invalid year format");
    }

    // Insert the expense into the database with parsed values
    const query = `
        INSERT INTO expenses (user_id, category, amount, reason, month, year)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;

    await db.query(query, [user_id, category, amount, reason, month, year]);
    res.render("addexpense", {
      expense,
      successMessage: "Added successfully!",
      errorMessage: null,
      month,
      year,
    }); // Assuming you are redirecting to the expenses page
  } catch (err) {
    res.render("addexpense", {
      successMessage: null,
      errorMessage: "Expense not found or could not be updated.",
      expense, // Passing current data for re-editing
    });
  }
};

// Get all expenses for a specific user
exports.getExpenses = async (req, res) => {
  const { user_id } = req.query;
  try {
    const query = "SELECT * FROM expenses WHERE user_id = ?";
    const [rows] = await db.query(query, [user_id]);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).send("Error fetching expenses: " + err.message);
  }
};

// View all expenses for a user for a specific year and month
exports.viewExpenses = async (req, res) => {
  const { userId, year, month } = req.params;
  try {
    // Correct query with PostgreSQL's placeholder syntax and accessing 'rows'
    const result = await db.query(
      "SELECT * FROM expenses WHERE user_id = $1 AND year = $2 AND month = $3",
      [userId, year, month]
    );

    // The result.rows will contain the array of expenses
    const expenses = result.rows;

    // Render the expenses overview page and pass the data
    res.render("expensesOverview", { expenses, year, month });
  } catch (err) {
    res.status(500).send("Error fetching expenses: " + err.message);
  }
};

// expenseController.js (or wherever your controller is)

exports.editExpense = async (req, res) => {
  const { id, month, year } = req.params; // Extract the id from the URL parameters
  try {
    // Query the database to fetch the expense data by id
    const result = await db.query("SELECT * FROM expenses WHERE id = $1", [id]);
    const rows = result.rows; // Extract rows from the result object

    // Check if the expense is found
    if (rows.length > 0) {
      const expense = rows[0]; // Get the first result (since IDs should be unique)
      res.render("editExpense", {
        expense,
        errorMessage: null,
        month,
        year,
        successMessage: null,
      }); // Pass the expense data to the view
    } else {
      // If the expense is not found, return a 404 status
      res.status(404).send("Expense not found.");
    }
  } catch (err) {
    // If there's an error with the query, send a 500 error with the message
    res.status(500).send("Error fetching expense: " + err.message);
  }
};

// expenseController.js (or wherever your controller is)

exports.updateExpense = async (req, res) => {
  const { id } = req.params; // Expense ID from the URL
  const { category, amount, reason, month, year } = req.body; // Data from the form
  const expense = { id, category, amount, reason, month, year };
  try {
    // Update query using PostgreSQL parameterized queries
    const query = `
          UPDATE expenses 
          SET category = $1, amount = $2, reason = $3, month = $4, year = $5
          WHERE id = $6
          RETURNING *;  -- Optionally returning the updated row for confirmation
      `;
    const result = await db.query(query, [
      category,
      amount,
      reason,
      month,
      year,
      id,
    ]);

    if (result.rowCount > 0) {
      // Checking if the update was successful
      // If update is successful, redirect to the expenses list
      res.render("editExpense", {
        expense,
        successMessage: "updated successfully!",
        errorMessage: null,
        month,
        year,
      }); // Assuming you are redirecting to the expenses page
    } else {
      // If no rows are updated (ID not found), show the error message
      res.render("editExpense", {
        successMessage: null,
        errorMessage: "Expense not found or could not be updated.",
        expense: { id, category, amount, reason, month, year },
        month,
        year, // Passing current data for re-editing
      });
    }
  } catch (err) {
    res.render("editExpense", {
      successMessage: null,
      errorMessage: "Error updating expense: " + err.message,
      expense: { id, category, amount, reason, month, year },
      month,
      year, // Retaining the form data for correction
    });
  }
};
