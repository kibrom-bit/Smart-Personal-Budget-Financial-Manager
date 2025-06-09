// src/services/UserService.js
const dbInstance = require("../models/db"); // Import the Singleton Database instance
const db = dbInstance.getPool(); // Get the actual PostgreSQL Pool object
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer"); // For sending emails

/**
 * UserService acts as the Receiver in the Command Pattern for user-related operations.
 * It contains the business logic for interacting with user data in the database.
 */
class UserService {
  constructor() {
    console.log("UserService initialized.");
  }

  /**
   * Registers a new user in the database.
   * @param {string} username - The user's chosen username.
   * @param {string} password - The user's raw password.
   * @param {string} email - The user's email address.
   * @returns {Promise<Object>} The newly registered user data.
   * @throws {Error} If registration fails (e.g., duplicate username/email).
   */
  async registerUser(username, password, email) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const query =
        "INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING *";
      const result = await db.query(query, [username, hashedPassword, email]);
      return result.rows[0];
    } catch (err) {
      console.error("Database error in UserService.registerUser:", err);
      // Check for specific error codes for duplicate entries
      if (err.code === "23505") {
        // PostgreSQL unique violation error code
        if (err.constraint === "users_username_key") {
          throw new Error(
            `Registration failed: Username '${username}' already exists.`
          );
        }
        if (err.constraint === "users_email_key") {
          throw new Error(
            `Registration failed: Email '${email}' is already registered.`
          );
        }
      }
      throw new Error("Failed to register user due to a database issue.");
    }
  }

  /**
   * Authenticates a user.
   * @param {string} username - The user's username.
   * @param {string} password - The user's raw password.
   * @returns {Promise<Object|null>} The user object if authenticated, null otherwise.
   * @throws {Error} If a database error occurs.
   */
  async loginUser(username, password) {
    try {
      const normalizedUsername = username.trim().toLowerCase();
      const query = "SELECT * FROM users WHERE LOWER(username) = $1";
      const { rows } = await db.query(query, [normalizedUsername]);

      if (rows.length === 0) {
        return null; // User not found
      }

      const user = rows[0];
      const match = await bcrypt.compare(password, user.password);

      return match ? user : null; // Return user object if password matches, else null
    } catch (err) {
      console.error("Database error in UserService.loginUser:", err);
      throw new Error("Failed to authenticate user due to a database issue.");
    }
  }

  /**
   * Handles password reset request by sending an email.
   * NOTE: generateResetToken is assumed to be available or needs to be implemented.
   * @param {string} email - The user's email.
   * @returns {Promise<void>}
   * @throws {Error} If email sending fails.
   */
  async requestPasswordReset(email) {
    // You would typically fetch user by email first and then generate a token.
    // For now, assuming generateResetToken creates a token.
    // NOTE: This part needs actual implementation for token generation and storing token/expiry in DB
    // and setting up correct email transport.

    // Placeholder for generateResetToken - this function needs to be defined globally
    // or imported if it's in a separate module.
    // For a real app, generate a unique token, save it to DB with expiry, and include in link.
    const token =
      typeof generateResetToken !== "undefined"
        ? generateResetToken(email)
        : "mock_token_123";

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "your-email@gmail.com", // REMINDER: Replace with your actual email
        pass: "your-email-password", // REMINDER: Replace with your actual password or app-specific password
      },
    });

    const mailOptions = {
      to: email,
      subject: "Password Reset Request",
      text: `Please reset your password by clicking on the following link: YOUR_RESET_LINK_HERE?token=${token}`, // REMINDER: Implement the actual reset link
    };

    await transporter.sendMail(mailOptions);
  }

  /**
   * Updates a user's profile information.
   * @param {number} userId - The ID of the user to update.
   * @param {string} email - The new email address.
   * @param {string|null} password - The new raw password (optional).
   * @returns {Promise<Object|null>} The updated user object, or null if user not found.
   * @throws {Error} If validation fails or a database error occurs.
   */
  async updateProfile(userId, email, password) {
    if (!email) {
      throw new Error("Email is required.");
    }

    let hashedPassword = null;
    if (password) {
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long.");
      }
      hashedPassword = await bcrypt.hash(password, 10);
    }

    let updateQuery = "UPDATE users SET email = $1";
    let queryParams = [email];

    if (hashedPassword) {
      updateQuery += ", password = $2";
      queryParams.push(hashedPassword);
    }

    const userIdPlaceholder = `$${queryParams.length + 1}`;
    updateQuery += ` WHERE id = ${userIdPlaceholder} RETURNING id, username, email`; // Return updated fields
    queryParams.push(userId);

    try {
      const result = await db.query(updateQuery, queryParams);
      if (result.rowCount === 0) {
        return null; // User not found
      }
      return result.rows[0]; // Return the updated user object
    } catch (err) {
      console.error("Database error in UserService.updateProfile:", err);
      // Check for specific error codes for duplicate email if applicable
      if (err.code === "23505" && err.constraint === "users_email_key") {
        throw new Error(
          `Profile update failed: Email '${email}' is already in use.`
        );
      }
      throw new Error("Failed to update profile due to a database issue.");
    }
  }

  /**
   * Fetches a user's profile by ID.
   * @param {number} userId - The ID of the user.
   * @returns {Promise<Object|null>} The user object if found, null otherwise.
   */
  async getUserProfile(userId) {
    try {
      const { rows } = await db.query(
        "SELECT id, username, email FROM users WHERE id = $1",
        [userId]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (err) {
      console.error("Database error in UserService.getUserProfile:", err);
      throw new Error("Failed to fetch user profile due to a database issue.");
    }
  }
}

module.exports = new UserService(); // Export a singleton instance of the UserService
