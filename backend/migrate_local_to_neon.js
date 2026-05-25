/**
 * NexCart — Local to Neon PostgreSQL Migration Tool
 * Migrates schemas and data from local PostgreSQL to Neon PostgreSQL.
 */
require('dotenv').config();
const { Client } = require('pg');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

// Safe order of table migration to respect foreign key constraints
const TABLE_ORDER = [
  'users',
  'products',
  'coupons',
  'cart',
  'wishlist',
  'orders',
  'order_items',
  'reviews',
  'recently_viewed'
];

async function runMigration() {
  console.log('==================================================');
  console.log('🚀 NexCart — Local PostgreSQL to Neon Migrator');
  console.log('==================================================\n');

  // 1. Gather Local Credentials
  const localDb = await askQuestion('📁 Local Database Name [default: nexcart_db]: ') || 'nexcart_db';
  const localUser = await askQuestion('👤 Local Username [default: postgres]: ') || 'postgres';
  const localPass = await askQuestion('🔑 Local Password: ');
  const localHost = await askQuestion('🌐 Local Host [default: localhost]: ') || 'localhost';
  const localPort = await askQuestion('🔌 Local Port [default: 5432]: ') || '5432';

  rl.close();

  const neonUrl = process.env.DATABASE_URL;
  if (!neonUrl) {
    console.error('❌ Error: DATABASE_URL not found in backend/.env file!');
    process.exit(1);
  }

  const localConfig = {
    host: localHost,
    port: parseInt(localPort),
    database: localDb,
    user: localUser,
    password: localPass
  };

  const localClient = new Client(localConfig);
  const neonClient = new Client({
    connectionString: neonUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('\n🔗 Connecting to local database...');
    await localClient.connect();
    console.log('✅ Connected to Local PostgreSQL');

    console.log('🔗 Connecting to Neon database...');
    await neonClient.connect();
    console.log('✅ Connected to Neon PostgreSQL');

    // 2. Fetch all public tables from Local DB
    const tablesRes = await localClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);
    const localTables = tablesRes.rows.map(r => r.table_name);
    console.log(`\n📋 Found ${localTables.length} tables in local database:`, localTables);

    // Fetch all public tables from Neon DB
    const neonTablesRes = await neonClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);
    const neonTables = neonTablesRes.rows.map(r => r.table_name);
    
    // Only migrate tables present in BOTH databases
    const commonTables = localTables.filter(t => neonTables.includes(t));
    const ignoredTables = localTables.filter(t => !neonTables.includes(t));
    if (ignoredTables.length > 0) {
      console.log(`⚠️  Ignoring local tables that do not exist on Neon:`, ignoredTables);
    }

    // Sort tables according to TABLE_ORDER so parent tables are migrated before child tables
    const sortedTables = [
      ...TABLE_ORDER.filter(t => commonTables.includes(t)),
      ...commonTables.filter(t => !TABLE_ORDER.includes(t)) // any other tables
    ];

    console.log('\n🔄 Starting migration...');

    for (const tableName of sortedTables) {
      console.log(`\n📦 Migrating table [${tableName}]...`);

      // A. Get columns of the table
      const colsRes = await localClient.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1 AND table_schema = 'public'
      `, [tableName]);
      const columns = colsRes.rows.map(r => r.column_name);

      // B. Fetch rows from local DB
      const rowsRes = await localClient.query(`SELECT * FROM "${tableName}"`);
      const rows = rowsRes.rows;
      console.log(`   - Found ${rows.length} rows locally`);

      // C. Truncate table on Neon (using CASCADE to handle any constraints)
      console.log(`   - Cleaning up old data in Neon table [${tableName}]...`);
      await neonClient.query(`TRUNCATE TABLE "${tableName}" CASCADE`);

      if (rows.length === 0) {
        console.log(`   - Table [${tableName}] is empty. Skipped inserts.`);
        continue;
      }

      // D. Batch insert into Neon
      const CHUNK_SIZE = 100;
      for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
        const chunk = rows.slice(i, i + CHUNK_SIZE);
        const valuePlaceholders = [];
        const flatValues = [];
        let paramIndex = 1;

        for (const row of chunk) {
          const placeholders = [];
          for (const col of columns) {
            placeholders.push(`$${paramIndex++}`);
            flatValues.push(row[col]);
          }
          valuePlaceholders.push(`(${placeholders.join(', ')})`);
        }

        const colsStr = columns.map(c => `"${c}"`).join(', ');
        const query = `INSERT INTO "${tableName}" (${colsStr}) VALUES ${valuePlaceholders.join(', ')}`;
        
        await neonClient.query(query, flatValues);
      }
      console.log(`   - Successfully inserted ${rows.length} rows into Neon`);

      // E. Update serial sequence if id exists
      if (columns.includes('id')) {
        try {
          const seqRes = await neonClient.query(`
            SELECT pg_get_serial_sequence($1, 'id') AS seq
          `, [tableName]);
          const seqName = seqRes.rows[0]?.seq;
          if (seqName) {
            await neonClient.query(`
              SELECT setval($1, COALESCE((SELECT MAX(id) FROM "${tableName}"), 1), true)
            `, [seqName]);
            console.log(`   - Reset serial sequence [${seqName}]`);
          }
        } catch (seqErr) {
          // Ignore if sequence update fails (e.g. table has no auto-incrementing serial id)
        }
      }
    }

    console.log('\n==================================================');
    console.log('🎉 Database migration completed successfully!');
    console.log('==================================================\n');

  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
  } finally {
    try { await localClient.end(); } catch (_) {}
    try { await neonClient.end(); } catch (_) {}
  }
}

runMigration();
