const { pool, query } = require('../config/db');

async function rename() {
  const userRes = await query(
    `UPDATE users SET login = 'baxriddin', updated_at = NOW()
     WHERE login = 'baxtiyor' RETURNING id`
  );
  if (userRes.rows[0]) {
    await query(
      `UPDATE doctors SET full_name = 'Baxriddin', updated_at = NOW()
       WHERE user_id = $1`,
      [userRes.rows[0].id]
    );
    console.log('✅ Baxtiyor → Baxriddin (login: baxriddin)');
  } else {
    const byName = await query(
      `UPDATE doctors SET full_name = 'Baxriddin', updated_at = NOW()
       WHERE full_name = 'Baxtiyor' RETURNING user_id`
    );
    if (byName.rows[0]) {
      await query(
        `UPDATE users SET login = 'baxriddin', updated_at = NOW() WHERE id = $1`,
        [byName.rows[0].user_id]
      );
      console.log('✅ Doctor ismi Baxriddin ga yangilandi');
    } else {
      console.log('ℹ️ Baxtiyor topilmadi — seed allaqachon yangilangan bo\'lishi mumkin');
    }
  }
  await pool.end();
}

rename().catch((e) => {
  console.error(e);
  process.exit(1);
});
