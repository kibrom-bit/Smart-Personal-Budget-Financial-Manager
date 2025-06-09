// src/commands/GetUserProfileCommand.js
const Command = require("./Command");
const userService = require("../services/UserService");

/**
 * GetUserProfileCommand is a concrete command to fetch a user's profile.
 */
class GetUserProfileCommand extends Command {
  /**
   * @param {number} userId - The ID of the user whose profile is being fetched.
   */
  constructor(userId) {
    super();
    this.userId = userId;
    this.receiver = userService;
  }

  /**
   * Executes the command to get a user's profile.
   * @returns {Promise<Object|null>} The user object if found, null otherwise.
   */
  async execute() {
    console.log(
      `[Command] Executing GetUserProfileCommand for user ID: ${this.userId}...`
    );
    return await this.receiver.getUserProfile(this.userId);
  }
}

module.exports = GetUserProfileCommand;
