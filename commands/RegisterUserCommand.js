// src/commands/RegisterUserCommand.js
const Command = require("./Command"); // Import the base Command class
const userService = require("../services/UserService"); // Import the UserService (Receiver)

/**
 * RegisterUserCommand is a concrete command that encapsulates the request to register a new user.
 */
class RegisterUserCommand extends Command {
  /**
   * @param {string} username - The username for the new user.
   * @param {string} password - The password for the new user.
   * @param {string} email - The email for the new user.
   */
  constructor(username, password, email) {
    super();
    this.username = username;
    this.password = password;
    this.email = email;
    this.receiver = userService; // The UserService is the receiver of this command
  }

  /**
   * Executes the command to register a user.
   * @returns {Promise<Object>} The registered user's data.
   */
  async execute() {
    console.log(
      `[Command] Executing RegisterUserCommand for username: ${this.username}...`
    );
    return await this.receiver.registerUser(
      this.username,
      this.password,
      this.email
    );
  }
}

module.exports = RegisterUserCommand;
