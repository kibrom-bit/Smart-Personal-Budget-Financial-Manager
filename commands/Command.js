/**
 * Abstract Command class.
 * All concrete commands must extend this class and implement the execute() method.
 */
class Command {
  /**
   * Executes the command's encapsulated action.
   * This method must be overridden by concrete command classes.
   * @abstract
   */
  execute() {
    throw new Error(
      "The 'execute()' method must be implemented by concrete Command classes."
    );
  }
}

module.exports = Command;
