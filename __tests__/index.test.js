// __tests__/index.test.js
const fs = require("fs");
const ejs = require("ejs");
const { JSDOM } = require("jsdom");
const path = require("path");
import "@testing-library/jest-dom"; // Import for toBeInTheDocument matcher

describe("index.ejs", () => {
  let dom;
  let document;
  let template;

  beforeEach(() => {
    const templatePath = path.join(__dirname, "../views/index.ejs"); // Updated path
    template = fs.readFileSync(templatePath, "utf-8");
    const html = ejs.render(template, {});
    dom = new JSDOM(html);
    document = dom.window.document;
  });

  test("renders the welcome heading", () => {
    const heading = document.querySelector(".hero-section h1");
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toContain("Welcome to Smart Financial Manager");
  });

  test("renders the 'Log In' link in the hero section with correct attributes", () => {
    const loginLink = document.querySelector('.hero-section a[href="/login"]');
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.textContent).toBe("Log In");
  });

  test("renders the 'Create Account' link in the hero section with correct attributes", () => {
    const registerLink = document.querySelector(
      '.hero-section a[href="/register"]'
    );
    expect(registerLink).toBeInTheDocument();
    expect(registerLink.textContent).toBe("Create Account");
  });

  test("renders the 'Why Choose Smart Financial Manager?' heading", () => {
    const featuresHeading = document.querySelector(".features-section h2");
    expect(featuresHeading).toBeInTheDocument();
    expect(featuresHeading.textContent).toContain(
      "Why Choose Smart Financial Manager?"
    );
  });

  test("renders at least 3 feature cards", () => {
    const featureCards = document.querySelectorAll(
      ".features-section .feature-card"
    );
    expect(featureCards.length).toBeGreaterThanOrEqual(3);
  });

  test("renders the 'How It Works' heading", () => {
    const howItWorksHeading = document.querySelector(".my-5 h2");
    expect(howItWorksHeading).toBeInTheDocument();
    expect(howItWorksHeading.textContent).toContain("How It Works");
  });

  test("renders at least 4 list items in 'How It Works' section", () => {
    const howItWorksListItems = document.querySelectorAll(
      ".my-5 ul.list-group-flush li"
    );
    expect(howItWorksListItems.length).toBeGreaterThanOrEqual(4);
  });

  test("renders the about me information", () => {
    const aboutMeText = document.querySelector(".about-me p:nth-child(1)");
    expect(aboutMeText).toBeInTheDocument();
    // Use .replace(/\s+/g, ' ') to normalize whitespace (including newlines)
    expect(aboutMeText.textContent.replace(/\s+/g, " ").trim()).toBe(
      "Developed by Kibrom Abebe from Mekelle, Ethiopia."
    );
  });

  test("renders the email link in about me section", () => {
    const emailLink = document.querySelector(
      ".about-me p:nth-child(2) a[href='mailto:kibromabebe20@gmail.com']"
    );
    expect(emailLink).toBeInTheDocument();
    expect(emailLink.textContent).toBe("kibromabebe20@gmail.com");
  });

  test("renders the footer with copyright information", () => {
    const footer = document.querySelector("footer p");
    expect(footer).toBeInTheDocument();
    expect(footer.textContent).toContain("© 2024 Smart Financial Manager.");
  });

  test("renders the scroll to top button", () => {
    const scrollToTopButton = document.querySelector(".scroll-to-top-btn");
    expect(scrollToTopButton).toBeInTheDocument();
    expect(scrollToTopButton.textContent.trim()).toBe("↑");
  });
});
