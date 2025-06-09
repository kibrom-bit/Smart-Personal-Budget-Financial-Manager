const { Pool } = require("pg");

const pool = new Pool({
  connectionString:
    "postgresql://postgres.cqponibolvxdqltxqdgu:!D.jrXCXPm$M@f9@aws-0-eu-central-1.pooler.supabase.com:5432/postgres",
  ssl: { rejectUnauthorized: false },
  // Add these optional configurations for better pool management
  max: 10, // maximum number of clients in the pool (adjust based on your actual needs)
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 5000, // how long to wait for a connection to be established
});

// Use pool.query() for an initial connection check.
// This method automatically acquires and releases a client from the pool.
pool
  .query("SELECT 1 + 1 AS solution")
  .then(() => console.log("Connected to the database!"))
  .catch((err) => console.error("Database connection error:", err.stack));

module.exports = pool;
