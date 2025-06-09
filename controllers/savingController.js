const db = require('../models/db');

// Set a saving goal
exports.setSavingGoal = async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login'); // Redirect to login if no session
}
  const user_id = req.session.user.id;
  const { year, month, savingsGoal } = req.body;

  if (!savingsGoal || !year || !month) {
      return res.render('addSaving', {
          errorMessage: 'All fields are required.',
          successMessage: null
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
      res.render('addSaving', {
          successMessage: 'Savings goal added successfully!',
          errorMessage: null,month,year
      });
  } catch (err) {
      res.render('addSaving', {
          errorMessage: 'Error setting saving goal: ' + err.message,
          successMessage: null,month,year
      });
  }
};



// Get savings for a user
exports.getSavings = async (req, res) => {
    const { user_id } = req.query;
    try {
        const query = "SELECT * FROM savings WHERE user_id = ?";
        const [rows] = await db.query(query, [user_id]);
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).send('Error fetching savings: ' + err.message);
    }
};

// Track savings for a user in a specific month and year
exports.trackSavings = async (req, res) => {
    const { userId, year, month } = req.params;
    try {
        const [savings] = await db.query("SELECT * FROM savings WHERE user_id = ? AND year = ? AND month = ?", [userId, year, month]);

        if (savings.length > 0) {
            const savingsGoal = savings[0].savings_goal;
            const currentSavings = savings[0].current_savings;

            res.render('trackSavings', { 
                savingsGoal, 
                currentSavings, 
                year, 
                month,
                message: 'Savings data fetched successfully.' 
            });
        } else {
            res.render('trackSavings', {
                message: 'No savings data found for the specified month and year.',
                savingsGoal: 0,
                currentSavings: 0,
                year,
                month
            });
        }
    } catch (err) {
        res.status(500).send('Error fetching savings: ' + err.message);
    }
};
// Handle the form submission for updating the savings goal
exports.updateSavings = async (req, res) => {
  const { id} = req.params; // Savings goal ID from the URL
  const { savings_goal, year, month } = req.body; // Data from the form

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
      saving={id:this.id};
      // Check if any rows were affected
      if (result.rows.length > 0) {
          res.render('editSaving', {saving,errorMessage: null,successMessage:"updated successfully",month,year }); // Redirect to the dashboard after successful update
      } else {
          res.render('editSaving', {saving,errorMessage: "Savings goal not found or could not be updated",successMessage:null,month,year });
      }
  } catch (err) {
      res.status(500).send('Error updating savings goal: ' + err.message);
  }
};

  // Controller - editSavings function
  exports.editSavings = async (req, res) => {
    const { id,month,year } = req.params; // Get the savings goal ID from the URL parameter

    try {
        // Fetch the savings goal from the database
        const { rows } = await db.query('SELECT * FROM savings WHERE id = $1', [id]);

        if (rows.length > 0) {
            const saving = rows[0]; // Get the first matching savings goal
            res.render('editSaving', { saving, errorMessage: null,successMessage:null,month,year }); // Pass the saving object to the view
        } else {
            res.render('editSaving', { saving, errorMessage: 'Savings goal not found',successMessage:null,month,year });
        }
    } catch (err) {
        res.status(500).send('Error fetching savings goal: ' + err.message);
    }
};

  