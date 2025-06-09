// src/commands/RequestPasswordResetCommand.js
const Command = require("./Command");
const userService = require("../services/UserService");

/**
 * RequestPasswordResetCommand is a concrete command to handle password reset requests.
 */
class RequestPasswordResetCommand extends Command {
  /**
   * @param {string} email - The email for which to request a password reset.
   */
  constructor(email) {
    super();
    this.email = email;
    this.receiver = userService;
  }

  /**
   * Executes the command to request a password reset.
   * @returns {Promise<void>}
   */
  async execute() {
    console.log(
      `[Command] Executing RequestPasswordResetCommand for email: ${this.email}...`
    );
    await this.receiver.requestPasswordReset(this.email);
  }
}

module.exports = RequestPasswordResetCommand;
