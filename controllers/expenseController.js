const dbInstance = require("../models/db"); // Import the Singleton Database instance
const db = dbInstance.getPool(); // Get the actual PostgreSQL Pool object
const AddExpenseCommand = require("../commands/AddExpenseCommand"); // Import the concrete Command

// Add an expense for the user
exports.addExpense = async (req, res) => {
  let { category, amount, reason, month, year } = req.body;
  if (!req.session.user) {
    return res.redirect("/login"); // Redirect to login if no session
  }
  const user_id = req.session.user.id;
  const expenseData = { category, amount, reason, month, year }; // Data for the command

  try {
    // Input validation (kept here as it's part of the controller's responsibility before executing command)
    const parsedYear = parseInt(year, 10);
    if (isNaN(parsedYear)) {
      return res.status(400).render("addexpense", {
        expense: expenseData,
        successMessage: null,
        errorMessage: "Invalid year format.",
        month,
        year,
      });
    }
    // Also, ensure amount is a number if your service expects it as such.
    // if (isNaN(amount) || amount <= 0) { ... handle error ... }

    // Create the command object
    const addCommand = new AddExpenseCommand(user_id, expenseData);

    // Execute the command - the Invoker's role
    const newExpense = await addCommand.execute();

    res.render("addexpense", {
      expense: newExpense, // Use the actual data returned by the command
      successMessage: "Expense added successfully!",
      errorMessage: null,
      month: newExpense.month, // Use the month/year returned by the service/db
      year: newExpense.year,
    });
  } catch (err) {
    console.error("Error in addExpense (Controller):", err);
    let errorMessage = "Failed to add expense. Please try again.";
    if (err.message.includes("Invalid month format")) {
      // Catch specific error from service
      errorMessage = err.message;
    } else if (err.message.includes("database issue")) {
      errorMessage = "A database error occurred while adding the expense.";
    }

    res.render("addexpense", {
      successMessage: null,
      errorMessage: errorMessage,
      expense: expenseData, // Pass original data for re-editing
      month, // Pass original month/year to retain form state
      year,
    });
  }
};

// Get all expenses for a specific user
// This part will remain as is for now, but could also be refactored into a command
exports.getExpenses = async (req, res) => {
  const { user_id } = req.query;
  try {
    const query = "SELECT * FROM expenses WHERE user_id = $1";
    const result = await db.query(query, [user_id]);
    const rows = result.rows;
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching expenses:", err);
    res.status(500).send("Error fetching expenses: " + err.message);
  }
};

// View all expenses for a user for a specific year and month
exports.viewExpenses = async (req, res) => {
  const { userId, year, month } = req.params;
  try {
    const result = await db.query(
      "SELECT * FROM expenses WHERE user_id = $1 AND year = $2 AND month = $3",
      [userId, year, month]
    );
    const expenses = result.rows;
    res.render("expensesOverview", { expenses, year, month });
  } catch (err) {
    console.error("Error viewing expenses:", err);
    res.status(500).send("Error fetching expenses: " + err.message);
  }
};

// Edit Expense (get form)
exports.editExpense = async (req, res) => {
  const { id, month, year } = req.params;
  try {
    const result = await db.query("SELECT * FROM expenses WHERE id = $1", [id]);
    const rows = result.rows;

    if (rows.length > 0) {
      const expense = rows[0];
      res.render("editExpense", {
        expense,
        errorMessage: null,
        month,
        year,
        successMessage: null,
      });
    } else {
      res.status(404).send("Expense not found.");
    }
  } catch (err) {
    console.error("Error fetching expense for edit:", err);
    res.status(500).send("Error fetching expense: " + err.message);
  }
};

// Update Expense (post form)
exports.updateExpense = async (req, res) => {
  const { id } = req.params;
  const { category, amount, reason, month, year } = req.body;
  const expense = { id, category, amount, reason, month, year };
  try {
    const query = `
          UPDATE expenses 
          SET category = $1, amount = $2, reason = $3, month = $4, year = $5
          WHERE id = $6
          RETURNING *;
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
      res.render("editExpense", {
        expense: result.rows[0], // Use the updated expense data from DB
        successMessage: "Updated successfully!",
        errorMessage: null,
        month,
        year,
      });
    } else {
      res.render("editExpense", {
        successMessage: null,
        errorMessage: "Expense not found or could not be updated.",
        expense: { id, category, amount, reason, month, year },
        month,
        year,
      });
    }
  } catch (err) {
    console.error("Error updating expense:", err);
    res.render("editExpense", {
      successMessage: null,
      errorMessage: "Error updating expense: " + err.message,
      expense: { id, category, amount, reason, month, year },
      month,
      year,
    });
  }
};
