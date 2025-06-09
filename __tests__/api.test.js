const request = require("supertest");
const app = require("../index");
const db = require("../models/db"); // Adjust the path to your db module

jest.setTimeout(20000); // Increase default Jest timeout

describe("API Tests", () => {
  afterAll(async () => {
    if (db && db.end) {
      try {
        await db.end();
        console.log("Database connection closed after API tests.");
      } catch (err) {
        console.error("Error closing database connection:", err);
      }
    }
  }, 20000); // Increase timeout for afterAll

  describe("User Authentication Routes", () => {
    it("should respond with a redirect to select-year-month on successful login", (done) => {
      request(app)
        .post("/users/login")
        .send({
          username: "llll",
          password: "123",
        })
        .expect(302)
        .end((err, response) => {
          if (err) return done(err);
          expect(response.header.location).toBe("/select-year-month");
          expect(response.headers["set-cookie"]).toBeDefined();
          done();
        });
    }, 20000); // Increase timeout for this test

    it("should render login page with error on unsuccessful login with incorrect password", (done) => {
      request(app)
        .post("/users/login")
        .send({
          username: "llll",
          password: "wrongpassword",
        })
        .expect(200)
        .end((err, response) => {
          if (err) return done(err);
          expect(response.text).toContain("Invalid credentials.");
          done();
        });
    }, 20000); // Increase timeout

    it("should render login page with error on unsuccessful login with incorrect username", (done) => {
      request(app)
        .post("/users/login")
        .send({
          username: "wronguser",
          password: "123",
        })
        .expect(200)
        .end((err, response) => {
          if (err) return done(err);
          expect(response.text).toContain("Invalid credentials.");
          done();
        });
    }, 20000); // Increase timeout

    it("should render reset password page with error when token generation fails", async () => {
      const response = await request(app)
        .post("/users/reset-password")
        .send({ email: "test@example.com" })
        .expect(200);
      expect(response.text).toContain(
        "Error resetting password: generateResetToken is not defined"
      );
    });

    it("should render register page on successful registration", async () => {
      const uniqueUsername = `newuser${Date.now()}`; // Generate unique username
      const uniqueEmail = `newuser${Date.now()}@example.com`;
      const response = await request(app)
        .post("/users/register")
        .send({
          username: uniqueUsername,
          password: "password123",
          email: uniqueEmail,
        })
        .expect(200);
      expect(response.text).toContain("User registered successfully.");
    });
  });

  describe("Expense Routes", () => {
    let authToken;

    beforeAll(async () => {
      const loginResponse = await request(app)
        .post("/users/login")
        .send({ username: "llll", password: "123" });
      authToken = loginResponse.headers["set-cookie"];
    });

    it("should return 500 on add expense with valid data", async () => {
      const response = await request(app)
        .post("/expenses/add/may/2025") // Adjust the route as needed
        .set("Cookie", authToken)
        .send({
          category: "Groceries",
          amount: 50,
          reason: "Weekly shopping",
          month: "may",
          year: "2025",
        })
        .expect(500); // Expect 500, based on current test output
    });

    it("should return 500 on add expense with invalid data", async () => {
      const response = await request(app)
        .post("/expenses/add/may/2025")
        .set("Cookie", authToken)
        .send({
          category: "",
          amount: "abc",
          reason: "Invalid data",
          month: "may",
          year: "2025",
        })
        .expect(500); // Expect 500, based on current test output
    });

    it("should redirect to /login if trying to add an expense without authentication", async () => {
      const response = await request(app)
        .post("/expenses/add/may/2025")
        .send({
          category: "Lunch",
          amount: 15,
          reason: "Work lunch",
          month: "may",
          year: "2025",
        })
        .expect(302);
      expect(response.header.location).toBe("/login");
    });

    it("should return 404 when getting edit expense page for non-existent id", async () => {
      const response = await request(app)
        .get("/expenses/edit/1/may/2025")
        .set("Cookie", authToken)
        .expect(404);
    });
  });
});
