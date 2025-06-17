Design Patterns Implemented
This project strategically utilizes two fundamental design patterns to enhance its architecture, maintainability, and scalability: the Singleton Pattern and the Command Pattern.

1. Singleton Pattern
Pattern Type: Creational

Location: Primarily in models/db.js

Purpose & Application:

Ensures a Single Instance: The Singleton Pattern guarantees that only one instance of the database connection pool (pg.Pool) exists throughout the entire application. This is crucial for efficient resource management, preventing connection leaks, and optimizing database interactions.

Global Access Point: It provides a centralized, globally accessible point for all modules (controllers, services) to retrieve and utilize the same database connection pool. This prevents redundant connections and ensures consistency in database access.

Resource Efficiency: By managing a single pool, the application avoids the overhead of creating and destroying multiple database connections, leading to better performance and reduced resource consumption.

2. Command Pattern
Pattern Type: Behavioral

Location:

src/commands/Command.js: Abstract base class for all commands.

src/services/UserService.js & src/services/ExpenseService.js: These act as Receivers, containing the actual business logic (e.g., database operations).

src/commands/*Command.js (e.g., RegisterUserCommand.js, AddExpenseCommand.js): These are Concrete Commands, encapsulating specific actions and their necessary data.

controllers/userController.js & controllers/expenseController.js (and potentially others): These act as Invokers, creating and executing Command objects without knowing the concrete details of the operations.

Purpose & Application:

Decoupling: The Command Pattern decouples the sender of a request (the controller/Invoker) from the object that performs the action (the Service/Receiver). Controllers no longer directly interact with low-level business logic or database operations; they simply issue commands.

Encapsulation of Actions: Each user action (like registering a user, logging in, or adding an expense) is encapsulated into its own Command object. This makes the code highly organized, with each command representing a distinct, actionable unit.

Flexibility and Extensibility: This pattern makes it easier to extend the application by adding new commands without altering existing controller logic. It also lays the groundwork for features like logging commands, queuing operations, or even implementing undo/redo functionality in the future.

Improved Testability: By separating concerns, it becomes simpler to unit test the business logic within the Services/Receivers and the command logic independently.

Why Multiple Patterns?
Modern applications benefit from using multiple design patterns because different problems require different solutions. While the Singleton provides a robust way to manage a shared resource, the Command pattern offers a flexible and maintainable way to structure specific user actions. Using a combination of patterns leads to a more organized, scalable, and understandable codebase.
