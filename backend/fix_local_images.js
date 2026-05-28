/**
 * fix_local_images.js
 * One-time script to clear out old localhost:5000/uploads/... image URLs
 * from the database that were created before the S3 migration.
 *
 * Run with: node fix_local_images.js
 */

require('dotenv').config();
const { Pool } = require('pg');

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
});

async function fixLocalImages() {
  console.log('🔍 Scanning for products with local/localhost image URLs...\n');

  // Find all affected products
  const { rows } = await db.query(`
    SELECT id, title, image_url
    FROM products
    WHERE image_url IS NOT NULL
      AND (
        image_url LIKE '%localhost%'
        OR image_url LIKE '%127.0.0.1%'
        OR image_url LIKE '/uploads/%'
      )
    ORDER BY id
  `);

  if (rows.length === 0) {
    console.log('✅ No local image URLs found — database is already clean!');
    await db.end();
    return;
  }

  console.log(`Found ${rows.length} product(s) with broken local URLs:\n`);
  rows.forEach(p =>
    console.log(`  [ID ${p.id}] "${p.title}"\n           ${p.image_url}`)
  );

  // Clear the local URLs (set to NULL) so the frontend fallback image shows
  // instead of a broken icon. Re-upload images via Admin Panel to fix properly.
  const { rowCount } = await db.query(`
    UPDATE products
    SET image_url = NULL
    WHERE image_url IS NOT NULL
      AND (
        image_url LIKE '%localhost%'
        OR image_url LIKE '%127.0.0.1%'
        OR image_url LIKE '/uploads/%'
      )
  `);

  console.log(`\n✅ Cleared ${rowCount} local image URL(s) from the database.`);
  console.log('\n📋 Next steps:');
  console.log('   1. These products will now show a placeholder image (no broken icon).');
  console.log('   2. Go to Admin Panel → Products → Edit each product above.');
  console.log('   3. Use "Upload Image" to re-upload the image — it will go to S3 this time.');

  await db.end();
}

fixLocalImages().catch(err => {
  console.error('\n❌ Script failed:', err.message);
  process.exit(1);
});
