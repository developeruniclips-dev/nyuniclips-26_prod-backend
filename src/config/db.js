const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "uniclips",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10
});

// Test connection (non-blocking)
pool.getConnection()
  .then(conn => {
    console.log("✅ Connected to MySQL on port " + (process.env.DB_PORT || 3306));
    conn.release();
  })
  .catch(err => {
    console.warn("⚠️  MySQL Connection Warning:", err.message);
    console.warn("⚠️  Server will start but database operations will fail until MySQL is running");
  });

module.exports = { pool };
