// src/commands/LoginUserCommand.js
const Command = require("./Command");
const userService = require("../services/UserService");

/**
 * LoginUserCommand is a concrete command that encapsulates the request to log in a user.
 */
class LoginUserCommand extends Command {
  /**
   * @param {string} username - The username of the user attempting to log in.
   * @param {string} password - The password of the user attempting to log in.
   */
  constructor(username, password) {
    super();
    this.username = username;
    this.password = password;
    this.receiver = userService;
  }

  /**
   * Executes the command to log in a user.
   * @returns {Promise<Object|null>} The user object if login is successful, null otherwise.
   */
  async execute() {
    console.log(
      `[Command] Executing LoginUserCommand for username: ${this.username}...`
    );
    return await this.receiver.loginUser(this.username, this.password);
  }
}

module.exports = LoginUserCommand;
