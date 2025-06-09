const db = require("../models/db");
const { generateToken } = require("../middlewares/authMiddleware");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt"); // Add bcrypt for hashing passwords
// Password Reset Functionality
const resetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    // Generate token and send it via email
    const token = generateResetToken(email); // Implement a function to create a reset token (you can generate a JWT token or any random string)
    const transporter = nodemailer.createTransport({
      service: "gmail", // Use a valid email service
      auth: {
        user: "your-email@gmail.com",
        pass: "your-email-password",
      },
    });

    const mailOptions = {
      to: email,
      subject: "Password Reset Request",
      text: `Please reset your password by clicking on the following link: [reset link with token]`,
    };

    await transporter.sendMail(mailOptions);
    res.render("reset", { message: "Password reset email sent.", error: null });
  } catch (err) {
    res.render("reset", {
      error: "Error resetting password: " + err.message,
      message: null,
    });
  }
};

// Register User
const registerUser = async (req, res) => {
  const { username, password, email } = req.body;
  try {
    // Hash the password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // Use $1, $2, $3 for PostgreSQL
    const query =
      "INSERT INTO users (username, password, email) VALUES ($1, $2, $3)";

    // Pass the parameters in the correct order
    await db.query(query, [username, hashedPassword, email]); // Store the hashed password

    res.render("register", {
      message: "User registered successfully.",
      error: null,
    });
  } catch (err) {
    res.render("register", {
      error: "Error registering user: " + err.message,
      message: null,
    });
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Normalize input
    const normalizedUsername = username.trim().toLowerCase();
    // Correct query syntax for PostgreSQL
    const query = "SELECT * FROM users WHERE LOWER(username) = $1";

    // Execute the query with the parameter
    const { rows } = await db.query(query, [normalizedUsername]);

    if (rows.length) {
      const user = rows[0];
      console.log("User found:", user);

      // Compare hashed password
      const match = await bcrypt.compare(password, user.password);

      if (match) {
        req.session.user = {
          id: user.id,
          username: user.username,
          email: user.email,
        };
        console.log("Login successful, redirecting...");
        return res.redirect("/select-year-month");
      } else {
        console.log("Invalid password");
        return res.render("login", {
          error: "Invalid credentials.",
          message: null,
        });
      }
    } else {
      console.log("User not found");
      return res.render("login", {
        error: "Invalid credentials.",
        message: null,
      });
    }
  } catch (err) {
    console.error("Login error:", err);
    return res.render("login", {
      error: "Error logging in: " + err.message,
      message: null,
    });
  }
};

const logoutUser = (req, res) => {
  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.redirect("/dashboard"); // Redirect to a safe page
    }
    res.clearCookie("connect.sid"); // Clear the session cookie
    res.render("login", {
      message: "You have been logged out successfully.",
      error: null,
    });
  });
};

module.exports = {
  resetPassword,
  registerUser,
  loginUser,
  logoutUser,
};
