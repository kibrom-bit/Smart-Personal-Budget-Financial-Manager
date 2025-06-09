const dbInstance = require("../models/db"); // Import the Singleton Database instance
const db = dbInstance.getPool(); // Get the actual PostgreSQL Pool object

// Set or update a user's budget for a specific month and year
exports.setBudget = async (req, res) => {
  const { year, month, budget_amount } = req.body;
  if (!req.session.user) {
    return res.redirect("/login"); // Redirect to login if no session
  }
  // Retrieve user_id from the session
  const user_id = req.session.user.id;

  const budget = { month, year, budget_amount };
  try {
    const query = `
      INSERT INTO budgets (user_id, year, month, budget_amount)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, year, month)
      DO UPDATE SET budget_amount = EXCLUDED.budget_amount;
    `;
    await db.query(query, [user_id, year, month, budget_amount]);
    res.render("addBudget", {
      budget,
      successMessage: "added successfully!",
      errorMessage: null,
      month,
      year,
    });
  } catch (err) {
    console.error("Error setting budget:", err); // Added console.error for debugging
    res.render("addBudget", {
      budget,
      errorMessage: "Error adding budget: " + err.message,
      successMessage: null,
      month,
      year,
    });
  }
};

// Get all budgets for a specific user
exports.getBudget = async (req, res) => {
  const { userId } = req.params;
  try {
    // Corrected for PostgreSQL: use $1 placeholder and db.query, access result.rows
    const query = "SELECT * FROM budgets WHERE user_id = $1";
    const result = await db.query(query, [userId]);
    const rows = result.rows;
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching budget:", err); // Added console.error for debugging
    res.status(500).send("Error fetching budget: " + err.message);
  }
};

// View the budget overview for a specific user, year, and month
exports.viewBudgetOverview = async (req, res) => {
  const { userId, year, month } = req.params;
  try {
    // Fetch expenses and budgets for the given user, year, and month using PostgreSQL placeholders
    const expensesResult = await db.query(
      "SELECT * FROM expenses WHERE user_id = $1 AND year = $2 AND month = $3",
      [userId, year, month]
    );
    const budgetsResult = await db.query(
      "SELECT * FROM budgets WHERE user_id = $1 AND year = $2 AND month = $3",
      [userId, year, month]
    );

    const expenses = expensesResult.rows;
    const budgets = budgetsResult.rows;

    // Calculate total expenses for the period
    const totalExpenses = expenses.reduce(
      (acc, expense) => acc + expense.amount,
      0
    );

    // Render the budget overview view with the fetched data
    res.render("budgetOverview", {
      expenses,
      budgets, // Multiple categories could exist
      totalExpenses,
      year,
      month,
    });
  } catch (err) {
    console.error("Error fetching budget overview:", err); // Added console.error for debugging
    res.status(500).send("Error fetching budget overview: " + err.message);
  }
};

exports.editBudget = async (req, res) => {
  const { id, month, year } = req.params; // Extract the id from the URL
  try {
    // Modify the query to fetch the budget by id
    const result = await db.query("SELECT * FROM budgets WHERE id = $1", [id]);

    if (result.rows.length > 0) {
      const budget = result.rows[0]; // Access the first row
      res.render("editBudget", {
        budget,
        errorMessage: null,
        successMessage: null,
        month,
        year,
      }); // Pass the budget to the view
    } else {
      res.status(404).send("Budget not found.");
    }
  } catch (err) {
    console.error("Error fetching budget for edit:", err); // Added console.error for debugging
    res.status(500).send("Error fetching budget: " + err.message);
  }
};

exports.updateBudget = async (req, res) => {
  const { id } = req.params; // Budget ID from the URL
  const { budget_amount, month, year } = req.body; // Data from the form

  try {
    // Update query
    const query = `
      UPDATE budgets 
      SET budget_amount = $1, month = $2, year = $3 
      WHERE id = $4
      RETURNING *;   -- This will return the updated row
    `;
    const result = await db.query(query, [budget_amount, month, year, id]);

    if (result.rows.length > 0) {
      // If update is successful, render the updated dashboard with success message
      res.render("editBudget", {
        successMessage: "updated successfully!",
        errorMessage: null,
        month,
        year,
        id,
        budget: { id, budget_amount, month, year },
        // Passing current data for re-editing
      }); // Assuming you are redirecting to the dashboard
    } else {
      // If no rows are updated (ID not found), show the error message
      res.render("editBudget", {
        successMessage: null,
        errorMessage: "Budget not found or could not be updated.",
        budget: { id, budget_amount, month, year }, // Passing current data for re-editing
      });
    }
  } catch (err) {
    console.error("Error updating budget:", err); // Added console.error for debugging
    res.render("editBudget", {
      errorMessage: "Error updating budget: " + err.message,
      budget: { id, budget_amount, month, year },
    });
  }
};
