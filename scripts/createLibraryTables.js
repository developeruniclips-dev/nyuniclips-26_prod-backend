const mysql = require('mysql2/promise');

async function createTables() {
  const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'Uniclips_26',
    database: 'uniclips',
    port: 3306
  });

  try {
    // Create user_library table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_library (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        subject_id INT NOT NULL,
        scholar_id INT NOT NULL,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_course (user_id, subject_id, scholar_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
      )
    `);
    console.log('user_library table created');

    // Create video_progress table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS video_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        video_id INT NOT NULL,
        watched BOOLEAN DEFAULT FALSE,
        watched_at TIMESTAMP NULL,
        UNIQUE KEY unique_progress (user_id, video_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
      )
    `);
    console.log('video_progress table created');

    console.log('All tables created successfully!');
  } catch (err) {
    console.error('Error creating tables:', err);
  } finally {
    await pool.end();
  }
}

createTables();
