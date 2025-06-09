const db = require('../models/db'); // Assuming you have a db.js to manage database queries
const bcrypt = require('bcrypt'); // For password hashing

// Get Profile Controller
exports.getProfile = async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login'); // Redirect to login if no session
    }

    const userId = req.session.user.id; // Get user ID from session

    try {
        // Fetch user details from the database (PostgreSQL uses $1, $2, etc., as placeholders)
        const { rows } = await db.query("SELECT id, username, email FROM users WHERE id = $1", [userId]);
        
        if (rows.length > 0) {
            const user = rows[0]; // Assuming user exists
            res.render('profile', { user , errorMessage:null, successMessage:null}); // Render the profile page with user data
        } else {
            res.status(404).send('User not found');
        }
    } catch (err) {
        res.status(500).send('Error loading profile: ' + err.message);
    }
};


// Update Profile Controller
exports.updateProfile = async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login'); // Redirect to login if no session
    }
    const userId = req.session.user.id;  // Get user ID from session
    const { email, password } = req.body;  // Get new email and password from form

    // Check if email is provided
    if (!email) {
        return res.status(400).send('Email is required.');
    }

    try {
        // Hash new password if provided
        let hashedPassword = null;
        if (password) {
            // Ensure password is valid before hashing
            if (password.length < 6) {
                return res.status(400).send('Password must be at least 6 characters long.');
            }
            hashedPassword = await bcrypt.hash(password, 10);  // Hash password
        }

        // Update user profile in the database
        let updateQuery = "UPDATE users SET email = $1";  // PostgreSQL placeholder
        let queryParams = [email];

        // Only update password if a new one is provided
        if (hashedPassword) {
            updateQuery += ", password = $2";  // Adjust for PostgreSQL
            queryParams.push(hashedPassword);
        }

        updateQuery += " WHERE id = $3";  // Update user by ID
        queryParams.push(userId);

        const result = await db.query(updateQuery, queryParams);  // Execute update query

        // Check if the update was successful (rowCount is used in PostgreSQL)
        if (result.rowCount === 0) {
            return res.status(404).send('User not found or no changes made.');
        }

        // Update session data
        req.session.user.email = email;  // Update session email
        try {
            // Fetch user details from the database (PostgreSQL uses $1, $2, etc., as placeholders)
            const { rows } = await db.query("SELECT id, username, email FROM users WHERE id = $1", [userId]);
            
            if (rows.length > 0) {
                const user = rows[0]; // Assuming user exists
                res.render('profile', { user , errorMessage:null, successMessage:"password successfully changed!"}); // Render the profile page with user data
            } else {
                res.status(404).send('User not found');
            }
        } catch (err) {
            res.status(500).send('Error loading profile: ' + err.message);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating profile: ' + err.message);
    }
};
