// __tests__/login.test.js
const fs = require("fs");
const ejs = require("ejs");
const { JSDOM } = require("jsdom");
const path = require("path");
import "@testing-library/jest-dom"; // Import for toBeInTheDocument matcher

describe("login.ejs", () => {
  let dom;
  let document;
  let template;

  beforeEach(() => {
    const templatePath = path.join(__dirname, "../views/login.ejs"); // Updated path
    template = fs.readFileSync(templatePath, "utf-8");
  });

  const renderTemplate = (data) => {
    const html = ejs.render(template, data);
    dom = new JSDOM(html);
    document = dom.window.document;
  };

  test("renders the login form with correct attributes and elements", () => {
    renderTemplate({ message: null, error: null }); // Provide message and error
    const form = document.querySelector(
      'form[action="/users/login"][method="POST"]'
    );
    expect(form).toBeInTheDocument();

    const usernameLabel = document.querySelector('label[for="username"]');
    const usernameInput = document.querySelector(
      'input[type="text"][name="username"]'
    );
    expect(usernameLabel).toBeInTheDocument();
    expect(usernameLabel.textContent).toBe("Username:"); // Assuming label text
    expect(usernameInput).toBeInTheDocument();

    const passwordLabel = document.querySelector('label[for="password"]');
    const passwordInput = document.querySelector(
      'input[type="password"][name="password"]'
    );
    expect(passwordLabel).toBeInTheDocument();
    expect(passwordLabel.textContent).toBe("Password:"); // Assuming label text
    expect(passwordInput).toBeInTheDocument();

    const submitButton = document.querySelector('button[type="submit"]');
    expect(submitButton).toBeInTheDocument();
    expect(submitButton.textContent).toBe("Login");
  });

  test("renders success message if provided", () => {
    renderTemplate({ message: "Login successful!", error: null });
    const successMessage = document.querySelector(".message-success");
    expect(successMessage).toBeInTheDocument();
    expect(successMessage.textContent).toContain("Login successful!");
  });

  test("renders error message if provided", () => {
    renderTemplate({ message: null, error: "Invalid credentials." });
    const errorMessage = document.querySelector(".message-error");
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage.textContent).toContain("Invalid credentials.");
  });

  test("does not render messages if both are null", () => {
    renderTemplate({ message: null, error: null });
    expect(document.querySelector(".message-success")).toBeNull();
    expect(document.querySelector(".message-error")).toBeNull();
  });

  test("renders 'Back to Home' link", () => {
    renderTemplate({ message: null, error: null });
    const backToHomeLink = document.querySelector('div.links p a[href="/"]');
    expect(backToHomeLink).toBeInTheDocument();
    expect(backToHomeLink.textContent).toBe("Back to Home");
  });

  // You can add more tests for specific error scenarios
  // or the presence of other elements in your login form
});
