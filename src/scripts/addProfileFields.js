const mysql = require('mysql2/promise');
require('dotenv').config();

async function addProfileFields() {
  console.log('Connecting to database...');
  console.log('Host:', process.env.DB_HOST || 'localhost');
  console.log('Port:', process.env.DB_PORT || '3306');
  console.log('Database:', process.env.DB_NAME || 'uniclips');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'uniclips',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306
  });

  try {
    console.log('✅ Connected to database');
    console.log('Adding profile fields to users table...');
    
    // Check which columns already exist
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM users
    `);
    
    const existingColumns = columns.map(col => col.Field);
    console.log('Existing columns:', existingColumns.join(', '));
    
    // Add columns one by one to avoid errors
    const columnsToAdd = [
      { name: 'bio', type: 'TEXT' },
      { name: 'favorite_subject', type: 'VARCHAR(255)' },
      { name: 'favorite_food', type: 'VARCHAR(255)' },
      { name: 'hobbies', type: 'VARCHAR(500)' },
      { name: 'iban', type: 'VARCHAR(34)' },
      { name: 'tax_card_url', type: 'VARCHAR(500)' }
    ];
    
    for (const col of columnsToAdd) {
      if (!existingColumns.includes(col.name)) {
        await connection.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
        console.log(`✅ Added column: ${col.name}`);
      } else {
        console.log(`ℹ️  Column ${col.name} already exists, skipping`);
      }
    }
    
    console.log('\n✅ Profile fields migration completed successfully!');
  } catch (error) {
    console.error('❌ Error adding profile fields:', error.message);
    console.error(error);
  } finally {
    await connection.end();
    console.log('Database connection closed');
  }
}

addProfileFields();
