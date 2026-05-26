const { Client } = require('pg');

const url = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/dental_clinic';
const maxAttempts = 30;

async function wait() {
  for (let i = 1; i <= maxAttempts; i++) {
    const client = new Client({ connectionString: url });
    try {
      await client.connect();
      await client.query('SELECT 1');
      await client.end();
      console.log('✅ PostgreSQL tayyor');
      return;
    } catch {
      try { await client.end(); } catch {}
      console.log(`⏳ DB kutilmoqda... (${i}/${maxAttempts})`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  console.error('❌ PostgreSQL ulanmadi. Docker ishlayaptimi?');
  process.exit(1);
}

wait();
