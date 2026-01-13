/**
 * Script to clear invalid Stripe account IDs for scholars
 * Usage: node src/scripts/clearStripeAccount.js <email>
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function clearStripeAccount() {
    const email = process.argv[2];
    
    if (!email) {
        console.log('Usage: node src/scripts/clearStripeAccount.js <email>');
        process.exit(1);
    }

    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306
    });

    try {
        // Find the scholar
        const [rows] = await conn.query(`
            SELECT sp.*, u.email, u.fname, u.lname 
            FROM scholar_profile sp 
            JOIN users u ON sp.user_id = u.id 
            WHERE u.email LIKE ?
        `, [`%${email}%`]);

        if (rows.length === 0) {
            console.log('No scholar found with email containing:', email);
            return;
        }

        console.log('\nFound scholar(s):');
        rows.forEach(r => {
            console.log(`- ${r.fname} ${r.lname} (${r.email})`);
            console.log(`  Current stripe_account_id: ${r.stripe_account_id || 'NULL'}`);
        });

        // Clear the stripe account ID
        const [result] = await conn.query(`
            UPDATE scholar_profile sp
            JOIN users u ON sp.user_id = u.id
            SET sp.stripe_account_id = NULL, 
                sp.stripe_onboarding_complete = 0, 
                sp.stripe_details_submitted = 0
            WHERE u.email LIKE ?
        `, [`%${email}%`]);

        console.log(`\n✅ Cleared Stripe account for ${result.affectedRows} scholar(s)`);
        console.log('They can now reconnect with Stripe using the live keys.');

    } finally {
        await conn.end();
    }
}

clearStripeAccount().catch(console.error);
