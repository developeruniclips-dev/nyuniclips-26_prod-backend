const { pool } = require('../config/db');

async function addTaskCardColumn() {
    try {
        // Check if column exists first
        const [columns] = await pool.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'uniclips' 
            AND TABLE_NAME = 'scholar_profile' 
            AND COLUMN_NAME = 'task_card_url'
        `);
        
        if (columns.length > 0) {
            console.log('ℹ️ task_card_url column already exists');
        } else {
            // Add task_card_url column to scholar_profile table
            await pool.query(`
                ALTER TABLE scholar_profile 
                ADD COLUMN task_card_url VARCHAR(255) DEFAULT NULL
            `);
            console.log('✅ task_card_url column added to scholar_profile table');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        process.exit();
    }
}

addTaskCardColumn();
