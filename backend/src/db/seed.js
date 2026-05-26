const bcrypt = require('bcryptjs');
const { pool, query } = require('../config/db');

const DOCTORS = [
  { full_name: 'Sherzod', login: 'sherzod', password: 'doctor123', specialty: 'Stomatolog-terapevt', phone: '+998901234567' },
  { full_name: 'Feruza', login: 'feruza', password: 'doctor123', specialty: 'Ortodont', phone: '+998901234568' },
  { full_name: 'Baxtiyor', login: 'baxtiyor', password: 'doctor123', specialty: 'Jarroh stomatolog', phone: '+998901234569' },
];

async function seed() {
  const adminHash = await bcrypt.hash('admin123', 12);

  const adminUser = await query(
    `INSERT INTO users (login, password_hash, role)
     VALUES ($1, $2, 'admin')
     ON CONFLICT (login) DO UPDATE SET password_hash = EXCLUDED.password_hash
     RETURNING id`,
    ['admin', adminHash]
  );
  console.log('✅ Admin yaratildi (login: admin, parol: admin123)');

  for (const doc of DOCTORS) {
    const hash = await bcrypt.hash(doc.password, 12);
    const userRes = await query(
      `INSERT INTO users (login, password_hash, role)
       VALUES ($1, $2, 'doctor')
       ON CONFLICT (login) DO UPDATE SET password_hash = EXCLUDED.password_hash
       RETURNING id`,
      [doc.login, hash]
    );
    const userId = userRes.rows[0].id;

    await query(
      `INSERT INTO doctors (user_id, full_name, phone, specialty, work_days, work_start, work_end)
       VALUES ($1, $2, $3, $4, $5, '09:00', '18:00')
       ON CONFLICT (user_id) DO UPDATE SET
         full_name = EXCLUDED.full_name,
         specialty = EXCLUDED.specialty,
         phone = EXCLUDED.phone`,
      [
        userId,
        doc.full_name,
        doc.phone,
        doc.specialty,
        JSON.stringify(['dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma']),
      ]
    );
    console.log(`✅ Doctor ${doc.full_name} (login: ${doc.login}, parol: ${doc.password})`);
  }

  const doctorRes = await query('SELECT id FROM doctors LIMIT 1');
  if (doctorRes.rows[0]) {
    const samplePatients = [
      { full_name: 'Alisher Karimov', phone: '+998901111111', age: 32, gender: 'erkak', address: 'Toshkent, Chilonzor' },
      { full_name: 'Malika Yusupova', phone: '+998902222222', age: 28, gender: 'ayol', address: 'Toshkent, Yunusobod' },
      { full_name: 'Jasur Rahimov', phone: '+998903333333', age: 45, gender: 'erkak', address: 'Toshkent, Mirzo Ulugbek' },
    ];
    for (const p of samplePatients) {
      const exists = await query('SELECT id FROM patients WHERE phone = $1', [p.phone]);
      if (exists.rows.length === 0) {
        await query(
          `INSERT INTO patients (full_name, phone, age, gender, address, assigned_doctor_id, allergy, medical_history)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [p.full_name, p.phone, p.age, p.gender, p.address, doctorRes.rows[0].id, 'Penitsillin', 'Karies davolangan 2023']
        );
      }
    }
    console.log('✅ Namuna mijozlar qo\'shildi');
  }

  await pool.end();
  console.log('\n🎉 Seed tugallandi!');
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
