/**
 * NexCart — First-time setup script
 * Creates the nexcart_db database if it doesn't exist, then runs migrations
 */
require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function setup() {
  // Step 1: Connect to 'postgres' DB to create nexcart_db
  console.log('🔗 Connecting to PostgreSQL...');
  const adminClient = new Client({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '5432'),
    database: 'postgres',              // connect to default db first
    user:     process.env.DB_USER     || 'postgres',
    password: process.env.DB_PASSWORD || '',
  });

  try {
    await adminClient.connect();
    console.log('✅ Connected to PostgreSQL');

    // Check if nexcart_db exists
    const result = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = '${process.env.DB_NAME}'`
    );

    if (result.rows.length === 0) {
      console.log(`📦 Creating database '${process.env.DB_NAME}'...`);
      await adminClient.query(`CREATE DATABASE ${process.env.DB_NAME}`);
      console.log('✅ Database created');
    } else {
      console.log(`✅ Database '${process.env.DB_NAME}' already exists`);
    }
  } finally {
    await adminClient.end();
  }

  // Step 2: Run schema on nexcart_db
  const dbClient = new Client({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME     || 'nexcart_db',
    user:     process.env.DB_USER     || 'postgres',
    password: process.env.DB_PASSWORD || '',
  });

  try {
    await dbClient.connect();
    console.log('📄 Applying schema and seed data...');
    const sql = fs.readFileSync(path.join(__dirname, 'models', 'schema.sql'), 'utf8');
    await dbClient.query(sql);
    console.log('✅ Schema applied!');
    console.log('🎉 NexCart database is ready!');
    console.log('');
    console.log('Demo credentials:');
    console.log('  Admin: admin@nexcart.com / password123');
    console.log('  User:  john@example.com  / password123');
  } catch (err) {
    console.error('❌ Schema error:', err.message);
    process.exit(1);
  } finally {
    await dbClient.end();
  }
}

setup().catch(err => {
  console.error('❌ Setup failed:', err.message);
  console.error('\nPlease verify your PostgreSQL credentials in backend/.env');
  process.exit(1);
});
