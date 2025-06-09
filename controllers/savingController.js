const dbInstance = require("../models/db"); // Import the Singleton Database instance
const db = dbInstance.getPool(); // Get the actual PostgreSQL Pool object

// Set a saving goal
exports.setSavingGoal = async (req, res) => {
  const { year, month, savingsGoal } = req.body;
  if (!req.session.user) {
    return res.redirect("/login"); // Redirect to login if no session
  }
  const user_id = req.session.user.id;

  const budget = { month, year, savings_goal: savingsGoal }; // Use savings_goal for consistency
  if (!savingsGoal || !year || !month) {
    return res.render("addSaving", {
      errorMessage: "All fields are required.",
      successMessage: null,
      month,
      year,
      saving: budget, // Pass back the incomplete data for re-rendering
    });
  }

  try {
    const query = `
      INSERT INTO savings (user_id, year, month, savings_goal)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, year, month)
      DO UPDATE SET savings_goal = EXCLUDED.savings_goal;
    `;
    await db.query(query, [user_id, year, month, savingsGoal]);

    // If successful, render the page with a success message
    res.render("addSaving", {
      successMessage: "Savings goal added successfully!",
      errorMessage: null,
      month,
      year,
      saving: { user_id, year, month, savings_goal: savingsGoal }, // Pass the data back
    });
  } catch (err) {
    console.error("Error setting saving goal:", err); // Added console.error for debugging
    res.render("addSaving", {
      errorMessage: "Error adding budget: " + err.message, // This looks like a copy-paste error, should be "saving goal"
      successMessage: null,
      month,
      year,
      saving: budget,
    });
  }
};

// Get savings for a user
exports.getSavings = async (req, res) => {
  const { user_id } = req.query;
  try {
    const query = "SELECT * FROM savings WHERE user_id = $1"; // Correct PostgreSQL placeholder
    const result = await db.query(query, [user_id]); // Execute query and get result object
    const rows = result.rows; // Extract rows
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching savings:", err); // Added console.error for debugging
    res.status(500).send("Error fetching savings: " + err.message);
  }
};

// Track savings for a user in a specific month and year
exports.trackSavings = async (req, res) => {
  const { userId, year, month } = req.params;
  try {
    // Correct PostgreSQL placeholders and access .rows
    const result = await db.query(
      "SELECT * FROM savings WHERE user_id = $1 AND year = $2 AND month = $3",
      [userId, year, month]
    );
    const savings = result.rows; // Extract rows

    if (savings.length > 0) {
      const savingsGoal = savings[0].savings_goal;
      const currentSavings = savings[0].current_savings; // Assuming you have a current_savings column

      res.render("trackSavings", {
        savingsGoal,
        currentSavings,
        year,
        month,
        message: "Savings data fetched successfully.",
      });
    } else {
      res.render("trackSavings", {
        message: "No savings data found for the specified month and year.",
        savingsGoal: 0,
        currentSavings: 0,
        year,
        month,
      });
    }
  } catch (err) {
    console.error("Error tracking savings:", err); // Added console.error for debugging
    res.status(500).send("Error fetching savings: " + err.message);
  }
};

// Handle the form submission for updating the savings goal
exports.updateSavings = async (req, res) => {
  const { id } = req.params; // Savings goal ID from the URL
  const { savings_goal, year, month } = req.body; // Data from the form
  // Create a 'saving' object to pass to the render view, using the received data
  const saving = { id, savings_goal, year, month };

  try {
    // Update the savings goal in the database (PostgreSQL)
    const query = `
      UPDATE savings
      SET savings_goal = $1, year = $2, month = $3
      WHERE id = $4
      RETURNING *;
    `;

    // Using db.query to ensure it works with PostgreSQL client
    const result = await db.query(query, [savings_goal, year, month, id]);

    // Check if any rows were affected
    if (result.rows.length > 0) {
      res.render("editSaving", {
        saving,
        errorMessage: null,
        successMessage: "updated successfully",
        month,
        year,
      });
    } else {
      res.render("editSaving", {
        saving,
        errorMessage: "Savings goal not found or could not be updated",
        successMessage: null,
        month,
        year,
      });
    }
  } catch (err) {
    console.error("Error updating savings goal:", err); // Added console.error for debugging
    res.status(500).send("Error updating savings goal: " + err.message);
  }
};

// Controller - editSavings function
exports.editSavings = async (req, res) => {
  const { id, month, year } = req.params; // Get the savings goal ID from the URL parameter
  let saving = null; // Initialize saving as null for consistent passing to render

  try {
    // Fetch the savings goal from the database
    const { rows } = await db.query("SELECT * FROM savings WHERE id = $1", [
      id,
    ]);

    if (rows.length > 0) {
      saving = rows[0]; // Assign if found
      res.render("editSaving", {
        saving,
        errorMessage: null,
        successMessage: null,
        month,
        year,
      });
    } else {
      // If not found, create a placeholder 'saving' object with available params
      saving = { id, month, year, savings_goal: 0, current_savings: 0 }; // Placeholder for the view
      res.render("editSaving", {
        saving,
        errorMessage: "Savings goal not found",
        successMessage: null,
        month,
        year,
      });
    }
  } catch (err) {
    console.error("Error fetching savings goal for edit:", err); // Added console.error for debugging
    // On error, also try to pass a placeholder 'saving' object
    saving = saving || { id, month, year, savings_goal: 0, current_savings: 0 };
    res.status(500).send("Error fetching savings goal: " + err.message);
  }
};
