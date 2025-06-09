const Command = require("./Command"); // Import the base Command class
const expenseService = require("../services/ExpenseService"); // Import the ExpenseService (Receiver)

/**
 * AddExpenseCommand is a concrete command that encapsulates the request to add an expense.
 */
class AddExpenseCommand extends Command {
  /**
   * Creates an instance of AddExpenseCommand.
   * @param {number} userId - The ID of the user performing the action.
   * @param {Object} expenseData - The data for the expense to be added.
   * @param {string} expenseData.category
   * @param {number} expenseData.amount
   * @param {string} expenseData.reason
   * @param {string} expenseData.month
   * @param {number} expenseData.year
   */
  constructor(userId, expenseData) {
    super();
    this.userId = userId;
    this.expenseData = expenseData;
    this.receiver = expenseService; // The ExpenseService is the receiver of this command
  }

  /**
   * Executes the command by calling the appropriate method on the Receiver (ExpenseService).
   * @returns {Promise<Object>} The result from the receiver's operation.
   */
  async execute() {
    console.log(
      `[Command] Executing AddExpenseCommand for user ${this.userId}...`
    );
    // Delegate the actual work to the receiver
    return await this.receiver.addExpense(this.userId, this.expenseData);
  }
}

module.exports = AddExpenseCommand;
