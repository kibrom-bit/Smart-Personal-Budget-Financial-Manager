const express = require("express");
const path = require("path");
const app = express();
const session = require("express-session");
require("dotenv").config();
const bcrypt = require("bcrypt");
const favicon = require("serve-favicon");
const PORT = process.env.PORT || 3000;

// Middleware for parsing request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 3600000 }, // 1-hour expiration
  })
);

// Set EJS as the template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Set the views directory

// Serve static files (like CSS, images, etc.)
app.use(express.static(path.join(__dirname, "public")));

const mysql = require("mysql2/promise"); // Use promise-based API

// Import route files
const selectYearMonthRoutes = require("./routes/select-year-monthroutes");
const profileRoutes = require("./routes/profileRoutes");
const pageRoutes = require("./routes/pageRoutes");
const savingRoutes = require("./routes/savingRoutes");
const userRoutes = require("./routes/userRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const dashboardRoute = require("./routes/dashboardRoutes"); // Import the dashboard route
const { error } = require("console");

// Use the routes with their respective prefixes
app.use("/savings", savingRoutes);
app.use("/users", userRoutes);
app.use("/expenses", expenseRoutes);
app.use("/budgets", budgetRoutes);
app.use("/dashboard", dashboardRoute);
app.use("/", pageRoutes);
app.use("/profile", profileRoutes);
app.use("/select-year-month", selectYearMonthRoutes);

// Export the app object
module.exports = app;

// Start the server only if this file is run directly (not imported for testing)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
