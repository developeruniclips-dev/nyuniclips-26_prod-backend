const mysql = require("mysql2/promise");
require("dotenv").config();
const fs = require("fs");

const poolConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "uniclips",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Add SSL configuration for production databases (DigitalOcean, AWS RDS, etc.)
if (process.env.DB_SSL === 'true' && process.env.DB_SSL_CA) {
  try {
    poolConfig.ssl = {
      ca: fs.readFileSync(process.env.DB_SSL_CA)
    };
    console.log("✅ SSL certificate loaded for database connection");
  } catch (err) {
    console.warn("⚠️ Warning: Could not load SSL certificate:", err.message);
  }
}

const pool = mysql.createPool(poolConfig);

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
