const mysql = require('mysql2/promise');
const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'Uniclips_26',
    database: 'uniclips',
    port: 3306
});

async function createPayoutsTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS scholar_payouts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                scholar_user_id INT NOT NULL,
                stripe_transfer_id VARCHAR(255),
                amount DECIMAL(10,2) NOT NULL,
                currency VARCHAR(3) DEFAULT 'eur',
                status VARCHAR(50) DEFAULT 'pending',
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (scholar_user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ scholar_payouts table created');
        process.exit(0);
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

createPayoutsTable();
