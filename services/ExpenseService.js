const dbInstance = require("../models/db"); // Import the Singleton Database instance
const db = dbInstance.getPool(); // Get the actual PostgreSQL Pool object

/**
 * ExpenseService acts as the Receiver in the Command Pattern.
 * It contains the business logic for performing operations on expenses.
 */
class ExpenseService {
  /**
   * Adds a new expense to the database.
   * @param {number} userId - The ID of the user creating the expense.
   * @param {Object} expenseData - An object containing expense details.
   * @param {string} expenseData.category - The category of the expense.
   * @param {number} expenseData.amount - The amount of the expense.
   * @param {string} expenseData.reason - The reason for the expense.
   * @param {string} expenseData.month - The month of the expense (e.g., "may" or "5").
   * @param {number} expenseData.year - The year of the expense.
   * @returns {Promise<Object>} The newly created expense record from the database.
   * @throws {Error} If the month format is invalid or a database error occurs.
   */
  async addExpense(userId, { category, amount, reason, month, year }) {
    // Month conversion logic: Accepts month names (full/abbr) or numeric strings
    const monthMap = {
      january: 1,
      february: 2,
      march: 3,
      april: 4,
      may: 5,
      june: 6,
      july: 7,
      august: 8,
      september: 9,
      october: 10,
      november: 11,
      december: 12,
      // Abbreviated names
      jan: 1,
      feb: 2,
      mar: 3,
      apr: 4,
      jun: 6,
      jul: 7,
      aug: 8,
      sep: 9,
      oct: 10,
      nov: 11,
      dec: 12,
      // Numeric strings
      1: 1,
      2: 2,
      3: 3,
      4: 4,
      5: 5,
      6: 6,
      7: 7,
      8: 8,
      9: 9,
      10: 10,
      11: 11,
      12: 12,
    };

    const normalizedMonthKey = String(month).toLowerCase(); // Convert to string before toLowerCase
    const numericMonth = monthMap[normalizedMonthKey];

    if (!numericMonth) {
      throw new Error(
        `Invalid month format provided: "${month}". Please use a full month name (e.g., "January"), a recognized abbreviation, or a number (1-12).`
      );
    }

    try {
      const query = `
        INSERT INTO expenses (user_id, category, amount, reason, month, year)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `; // Removed the JS comment from within the SQL string
      const result = await db.query(query, [
        userId,
        category,
        amount,
        reason,
        numericMonth,
        year,
      ]);
      return result.rows[0]; // Return the first row of the inserted data
    } catch (err) {
      console.error("Database error in ExpenseService.addExpense:", err);
      throw new Error("Failed to save expense due to a database issue.");
    }
  }

  // Other expense-related business logic methods (e.g., updateExpense, deleteExpense, getExpenseById)
  // would also go here.
}

module.exports = new ExpenseService(); // Export a singleton instance of the ExpenseService
