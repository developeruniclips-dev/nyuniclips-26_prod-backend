/**
 * Migration to add stripe-related columns to scholar_profile table
 * Run this script to add missing columns to the production database
 * 
 * Usage: node src/migrations/add_stripe_columns.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
    });

    console.log('Connected to database');

    try {
        // Check which columns exist
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'scholar_profile'
        `, [process.env.DB_NAME]);

        const existingColumns = columns.map(c => c.COLUMN_NAME);
        console.log('Existing columns:', existingColumns);

        // Add stripe_onboarding_complete if it doesn't exist
        if (!existingColumns.includes('stripe_onboarding_complete')) {
            console.log('Adding stripe_onboarding_complete column...');
            await connection.query(`
                ALTER TABLE scholar_profile 
                ADD COLUMN stripe_onboarding_complete TINYINT(1) DEFAULT 0
            `);
            console.log('✅ Added stripe_onboarding_complete');
        } else {
            console.log('✅ stripe_onboarding_complete already exists');
        }

        // Add stripe_details_submitted if it doesn't exist
        if (!existingColumns.includes('stripe_details_submitted')) {
            console.log('Adding stripe_details_submitted column...');
            await connection.query(`
                ALTER TABLE scholar_profile 
                ADD COLUMN stripe_details_submitted TINYINT(1) DEFAULT 0
            `);
            console.log('✅ Added stripe_details_submitted');
        } else {
            console.log('✅ stripe_details_submitted already exists');
        }

        console.log('\n✅ Migration completed successfully!');

    } catch (error) {
        console.error('Migration error:', error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
