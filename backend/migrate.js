/**
 * NexCart Database Migration Script
 * Connects via pg and runs schema.sql
 */
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(process.env.DATABASE_URL ? {} : {
    host:     process.env.DB_HOST,
    port:     process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
    database: process.env.DB_NAME,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  }),
  ssl: (process.env.DATABASE_URL || process.env.DB_SSL === 'true')
    ? { rejectUnauthorized: false }
    : false
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('🔗 Connected to PostgreSQL...');
    const sql = fs.readFileSync(path.join(__dirname, 'models', 'schema.sql'), 'utf8');

    // Split on statement terminator to run each statement
    console.log('📄 Running schema...');
    await client.query(sql);
    console.log('✅ Schema and seed data applied successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
