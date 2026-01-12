const mysql = require('mysql2/promise');

async function createTable() {
  const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'Uniclips_26',
    database: 'uniclips',
    port: 3306
  });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subject_purchases (
        id INT AUTO_INCREMENT PRIMARY KEY,
        buyer_user_id INT NOT NULL,
        subject_id INT NOT NULL,
        scholar_id INT NOT NULL,
        amount DECIMAL(10,2) DEFAULT 6.00,
        currency VARCHAR(3) DEFAULT 'EUR',
        transaction_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (buyer_user_id) REFERENCES users(id),
        FOREIGN KEY (subject_id) REFERENCES subjects(id),
        FOREIGN KEY (scholar_id) REFERENCES users(id),
        UNIQUE KEY unique_purchase (buyer_user_id, subject_id, scholar_id)
      )
    `);
    console.log('✅ Table subject_purchases created successfully');
  } catch (e) {
    console.log('Error:', e.message);
  }
  
  await pool.end();
}

createTable();
