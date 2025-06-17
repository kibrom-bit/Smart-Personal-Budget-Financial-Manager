Testing Strategy and Documentation
This document outlines the testing approach for the Smart Financial Manager application, detailing the purpose of each test file and the specific test cases implemented.

1. Overall Testing Strategy
   The testing strategy for this project combines integration tests for API endpoints and unit/rendering tests for EJS views.

Integration Tests (api.test.js): These tests focus on verifying the interaction between different components of the application (e.g., controllers, services, database) by making actual HTTP requests to the application's endpoints. They ensure that the application's routes and underlying logic function correctly as a whole, including database operations.

Unit/Rendering Tests (\*.test.js for EJS views): These tests focus on the front-end rendering logic of individual EJS templates. They verify that the EJS views correctly display data, messages, and elements based on the provided input, without requiring a running server or database.

2. Test File Breakdown
   **tests**/api.test.js
   Purpose: This file contains integration tests for the application's backend API endpoints. It uses supertest to simulate HTTP requests and interacts with the actual Express application and the database.

Key Dependencies/Setup:

supertest: For making HTTP requests to the Express application.

app: The main Express application instance (require("../index.js")).

dbInstance: The Singleton Database instance (require("../models/db.js")).

jest.setTimeout: Increased to 20000ms to accommodate potential delays in database operations and network requests.

afterAll Hook: Ensures the database connection pool is gracefully closed (dbInstance.end()) after all tests in this file complete, preventing Jest from hanging.

Test Suites and Cases:

User Authentication Routes:

should respond with a redirect to select-year-month on successful login: Verifies successful login redirects to the dashboard and sets a session cookie.

should render login page with error on unsuccessful login with incorrect password: Confirms error message display for incorrect passwords.

should render login page with error on unsuccessful login with incorrect username: Confirms error message display for non-existent usernames.

should render reset password page with error when password reset fails (due to missing impl): Tests the behavior of the password reset route, expecting an error if generateResetToken or nodemailer are not fully configured in the test environment (highlights an area for further mocking/setup in a production test suite).

should redirect to login page on successful registration: Verifies new user registration successfully redirects.

should render register page with error on registration with existing username: Tests handling of duplicate username registration attempts.

Expense Routes:

beforeAll Hook: Logs in a user (llll/123) to obtain an authentication token (session cookie) for subsequent authenticated expense route tests.

should render add expense page with success message on add expense with valid data: Tests the POST /expenses/add/:month/:year route with valid data after a user is logged in.

should render add expense page with error on add expense with invalid data: Tests the POST /expenses/add/:month/:year route with invalid input, expecting an error message to be rendered on the add expense page.

should redirect to /login if trying to add an expense without authentication: Verifies that unauthenticated attempts to add an expense are correctly redirected to the login page.

should return 404 when getting edit expense page for non-existent id: Ensures the application correctly responds with a 404 for edit requests for non-existent expense IDs.

**tests**/Dashboard.test.js
Purpose: This file contains unit tests for the views/Dashboard.ejs template. It uses JSDOM to simulate a browser environment and ejs to render the template with various data states, then asserts the presence and content of HTML elements.

Key Dependencies/Setup:

fs, path: For reading the EJS template file.

ejs: For rendering the EJS template.

JSDOM: To create a virtual DOM environment for testing HTML output.

@testing-library/jest-dom: Provides custom Jest matchers (like toBeInTheDocument) for DOM assertions.

beforeEach Hook: Reads and prepares the EJS template before each test.

renderTemplate Helper: A utility function to render the EJS template with provided data and set up the JSDOM environment.

Test Cases:

renders the expenses table with data: Verifies that the expense table correctly displays mock expense data, including categories, amounts, reasons, dates, and edit links.

renders the budgets table with data: Verifies that the budget table correctly displays mock budget data, including amounts, year-month, and edit links.

renders the savings table with data: Verifies that the savings table correctly displays mock savings data, including goals, year, month, and edit links.

renders "No expenses recorded" if expenses array is empty: Checks if the appropriate "no data" message and an "Add Expense" link are displayed when there are no expenses.

renders "No budgets set yet" if budgets array is empty: Checks if the appropriate "no data" message and an "Add Budget" link are displayed when there are no budgets.

renders "No savings set yet" if savings array is empty: Checks if the appropriate "no data" message and an "Add Savings Goal" link are displayed when there are no savings.

renders the 'Go to Profile' link: Verifies the presence and text of the navigation link to the profile page.

renders the 'Logout' link: Verifies the presence and text of the logout link.

**tests**/index.test.js
Purpose: This file contains unit tests for the views/index.ejs (home page) template. Similar to Dashboard.test.js, it uses JSDOM and ejs to render and inspect the static content of the home page.

Key Dependencies/Setup:

Same as Dashboard.test.js (fs, ejs, JSDOM, @testing-library/jest-dom).

beforeEach Hook: Renders the index.ejs template for each test.

Test Cases:

renders the welcome heading: Verifies the main welcome message on the home page.

renders the 'Log In' link in the hero section with correct attributes: Checks the login link's presence and attributes.

renders the 'Create Account' link in the hero section with correct attributes: Checks the registration link's presence and attributes.

renders the 'Why Choose Smart Financial Manager?' heading: Verifies the presence of the features section heading.

renders at least 3 feature cards: Ensures the minimum number of feature cards are displayed.

renders the 'How It Works' heading: Verifies the presence of the "How It Works" section heading.

renders at least 4 list items in 'How It Works' section: Ensures the minimum number of steps are displayed in the "How It Works" section.

renders the about me information: Verifies the presence and content of developer information.

renders the email link in about me section: Checks the developer's email link.

renders the footer with copyright information: Verifies the footer content.

renders the scroll to top button: Checks for the presence of the scroll-to-top UI element.

**tests**/login.test.js
Purpose: This file contains unit tests for the views/login.ejs template. It ensures the login form is rendered correctly and that success/error messages are displayed as expected based on the data passed to the template.

Key Dependencies/Setup:

Same as Dashboard.test.js and index.test.js (fs, ejs, JSDOM, @testing-library/jest-dom).

beforeEach Hook: Reads the EJS template before each test.

renderTemplate Helper: A utility function to render the EJS template with provided data.

Test Cases:

renders the login form with correct attributes and elements: Verifies the presence of the form, username/password labels and inputs, and the submit button.

renders success message if provided: Checks if a success message is displayed when passed to the template.

renders error message if provided: Checks if an error message is displayed when passed to the template.

does not render messages if both are null: Ensures that message containers are not rendered when no messages are provided.

renders 'Back to Home' link: Verifies the presence and correct target of the "Back to Home" navigation link.
