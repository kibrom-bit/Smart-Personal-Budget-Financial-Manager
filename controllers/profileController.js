const dbInstance = require("../models/db"); // dbInstance is the Singleton Database object
const db = dbInstance.getPool(); // db is now the pg Pool
const bcrypt = require("bcrypt"); // For password hashing

// Get Profile Controller
// Declared as a local const variable
const getProfile = async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login"); // Redirect to login if no session
  }

  const userId = req.session.user.id; // Get user ID from session

  try {
    // Fetch user details from the database (PostgreSQL uses $1, $2, etc., as placeholders)
    const { rows } = await db.query(
      "SELECT id, username, email FROM users WHERE id = $1",
      [userId]
    );

    if (rows.length > 0) {
      const user = rows[0]; // Assuming user exists
      res.render("profile", { user, errorMessage: null, successMessage: null }); // Render the profile page with user data
    } else {
      res.status(404).send("User not found");
    }
  } catch (err) {
    console.error("Error loading profile:", err); // Added console.error for debugging
    res.status(500).send("Error loading profile: " + err.message);
  }
};

// Update Profile Controller
// Declared as a local const variable
const updateProfile = async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login"); // Redirect to login if no session
  }
  const userId = req.session.user.id; // Get user ID from session
  const { email, password } = req.body; // Get new email and password from form

  // Check if email is provided
  if (!email) {
    // Fetch user data again to correctly render the page with an error
    try {
      const { rows } = await db.query(
        "SELECT id, username, email FROM users WHERE id = $1",
        [userId]
      );
      const user = rows.length > 0 ? rows[0] : null;
      return res.render("profile", {
        user,
        errorMessage: "Email is required.",
        successMessage: null,
      });
    } catch (fetchErr) {
      console.error("Error refetching user for validation:", fetchErr);
      return res
        .status(500)
        .send("Error validating profile update: " + fetchErr.message);
    }
  }

  try {
    // Hash new password if provided
    let hashedPassword = null;
    if (password) {
      // Ensure password is valid before hashing
      if (password.length < 6) {
        // Fetch user data again to correctly render the page with an error
        try {
          const { rows } = await db.query(
            "SELECT id, username, email FROM users WHERE id = $1",
            [userId]
          );
          const user = rows.length > 0 ? rows[0] : null;
          return res.render("profile", {
            user,
            errorMessage: "Password must be at least 6 characters long.",
            successMessage: null,
          });
        } catch (fetchErr) {
          console.error("Error refetching user for validation:", fetchErr);
          return res
            .status(500)
            .send("Error validating profile update: " + fetchErr.message);
        }
      }
      hashedPassword = await bcrypt.hash(password, 10); // Hash password
    }

    // Update user profile in the database
    let updateQuery = "UPDATE users SET email = $1"; // PostgreSQL placeholder
    let queryParams = [email];

    // Only update password if a new one is provided
    if (hashedPassword) {
      updateQuery += ", password = $2"; // Adjust for PostgreSQL
      queryParams.push(hashedPassword);
    }

    // Determine the correct placeholder for userId based on how many parameters came before it
    const userIdPlaceholder = `$${queryParams.length + 1}`;
    updateQuery += ` WHERE id = ${userIdPlaceholder}`; // Update user by ID
    queryParams.push(userId);

    const result = await db.query(updateQuery, queryParams); // Execute update query

    // Check if the update was successful (rowCount is used in PostgreSQL)
    if (result.rowCount === 0) {
      // Fetch user data again to correctly render the page with an error
      try {
        const { rows } = await db.query(
          "SELECT id, username, email FROM users WHERE id = $1",
          [userId]
        );
        const user = rows.length > 0 ? rows[0] : null;
        return res.render("profile", {
          user,
          errorMessage: "User not found or no changes made.",
          successMessage: null,
        });
      } catch (fetchErr) {
        console.error("Error refetching user after no changes:", fetchErr);
        return res
          .status(500)
          .send("Error handling profile update result: " + fetchErr.message);
      }
    }

    // Update session data
    req.session.user.email = email; // Update session email
    // Fetch user details again to ensure the rendered page has the latest data
    const { rows: updatedUserRows } = await db.query(
      "SELECT id, username, email FROM users WHERE id = $1",
      [userId]
    );

    if (updatedUserRows.length > 0) {
      const user = updatedUserRows[0]; // Assuming user exists
      res.render("profile", {
        user,
        errorMessage: null,
        successMessage: "Profile successfully updated!",
      }); // Render the profile page with user data
    } else {
      res.status(404).send("User not found after update."); // Should ideally not happen if update was successful
    }
  } catch (err) {
    console.error("Error updating profile:", err);
    // Fetch user data again to correctly render the page with the error
    try {
      const { rows } = await db.query(
        "SELECT id, username, email FROM users WHERE id = $1",
        [userId]
      );
      const user = rows.length > 0 ? rows[0] : null;
      res.render("profile", {
        user,
        errorMessage: "Error updating profile: " + err.message,
        successMessage: null,
      });
    } catch (fetchErr) {
      console.error("Error refetching user after update error:", fetchErr);
      res.status(500).send("Error during profile update: " + err.message);
    }
  }
};

module.exports = {
  getProfile, // Export the functions declared with 'const'
  updateProfile, // Export the functions declared with 'const'
};
