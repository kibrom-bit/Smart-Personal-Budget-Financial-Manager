const { Pool } = require("pg"); // PostgreSQL client library

class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }

    this.pool = new Pool({
      connectionString:
        "postgresql://postgres.cqponibolvxdqltxqdgu:!D.jrXCXPm$M@f9@aws-0-eu-central-1.pooler.supabase.com:5432/postgres", // Your database connection URL
      ssl: { rejectUnauthorized: false }, // Enable SSL for secure connection
      max: 10, // maximum number of clients in the pool (adjust based on your actual needs)
      idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
      connectionTimeoutMillis: 30000, // how long to wait for a connection to be established
    });

    this.pool
      .query("SELECT 1 + 1 AS solution")
      .then(() => console.log("Connected to the database!"))
      .catch((err) => console.error("Database connection error:", err.stack));

    // Store the current instance as the singleton instance.
    Database.instance = this;
  }

  getPool() {
    return this.pool;
  }

  async end() {
    if (this.pool) {
      console.log("Attempting to gracefully close database connections...");
      await this.pool.end();
      console.log("Database connections closed.");
    }
  }
}

module.exports = new Database();
