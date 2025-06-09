// src/commands/UpdateProfileCommand.js
const Command = require("./Command");
const userService = require("../services/UserService");

/**
 * UpdateProfileCommand is a concrete command to handle updating a user's profile.
 */
class UpdateProfileCommand extends Command {
  /**
   * @param {number} userId - The ID of the user whose profile is being updated.
   * @param {string} email - The new email address.
   * @param {string|null} password - The new password (or null if not changing).
   */
  constructor(userId, email, password) {
    super();
    this.userId = userId;
    this.email = email;
    this.password = password;
    this.receiver = userService;
  }

  /**
   * Executes the command to update a user's profile.
   * @returns {Promise<Object|null>} The updated user object, or null if user not found.
   */
  async execute() {
    console.log(
      `[Command] Executing UpdateProfileCommand for user ID: ${this.userId}...`
    );
    return await this.receiver.updateProfile(
      this.userId,
      this.email,
      this.password
    );
  }
}

module.exports = UpdateProfileCommand;
