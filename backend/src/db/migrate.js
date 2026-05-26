const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function migrate() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  try {
    await pool.query(schema);
    console.log('✅ Ma\'lumotlar bazasi muvaffaqiyatli yaratildi');
  } catch (err) {
    const exists =
      err.code === '42P07' ||
      err.code === '42710' ||
      err.code === '42P06' ||
      /already exists/i.test(err.message);
    if (exists) {
      console.log('ℹ️ Jadvallar allaqachon mavjud — o\'tkazib yuborildi');
    } else {
      console.error('❌ Migratsiya xatosi:', err.message);
      process.exit(1);
    }
  } finally {
    await pool.end();
  }
}

migrate();
