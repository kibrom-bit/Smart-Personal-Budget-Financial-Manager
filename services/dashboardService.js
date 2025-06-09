// services/dashboardService.js
const db = require("../models/db");

class DashboardService {
  async getDashboardData(userId) {
    try {
      const queryExpenses = `SELECT * FROM expenses WHERE user_id = $1 ORDER BY id DESC`;
      const queryBudgets = `SELECT * FROM budgets WHERE user_id = $1 ORDER BY id DESC`;
      const querySavings = `SELECT * FROM savings WHERE user_id = $1 ORDER BY id DESC`;

      const expensesResults = await db.query(queryExpenses, [userId]);
      const budgetsResults = await db.query(queryBudgets, [userId]);
      const savingsResults = await db.query(querySavings, [userId]);

      return {
        expenses: expensesResults.rows,
        budgets: budgetsResults.rows,
        savings: savingsResults.rows,
      };
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw error;
    }
  }
}

module.exports = new DashboardService();
