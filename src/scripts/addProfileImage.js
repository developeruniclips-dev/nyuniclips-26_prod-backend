const mysql = require('mysql2/promise');
require('dotenv').config();

async function addProfileImageField() {
  console.log('Connecting to database...');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'uniclips',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306
  });

  try {
    console.log('✅ Connected to database');
    console.log('Adding profile_image_url column to users table...');
    
    // Check if column exists
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM users WHERE Field = 'profile_image_url'
    `);
    
    if (columns.length === 0) {
      await connection.query(`
        ALTER TABLE users ADD COLUMN profile_image_url VARCHAR(500)
      `);
      console.log('✅ Added profile_image_url column');
    } else {
      console.log('ℹ️  Column profile_image_url already exists');
    }
    
    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

addProfileImageField();
