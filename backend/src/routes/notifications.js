const express = require('express');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  const result = await query(
    `SELECT * FROM notifications WHERE user_id = $1 OR user_id IS NULL
     ORDER BY created_at DESC LIMIT 50`,
    [req.user.id]
  );
  res.json(result.rows);
});

router.put('/:id/read', authenticate, async (req, res) => {
  await query(
    'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
    [req.params.id, req.user.id]
  );
  res.json({ message: 'O\'qildi' });
});

router.post('/generate-reminders', authenticate, async (req, res) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];

  const appts = await query(
    `SELECT a.*, p.full_name, d.user_id as doctor_user_id
     FROM appointments a
     JOIN patients p ON p.id = a.patient_id
     JOIN doctors d ON d.id = a.doctor_id
     WHERE a.appointment_date = $1 AND a.status IN ('kutilmoqda', 'tasdiqlangan')`,
    [dateStr]
  );

  for (const a of appts.rows) {
    await query(
      `INSERT INTO notifications (user_id, patient_id, type, title, message)
       VALUES ($1, $2, 'appointment_reminder', $3, $4)`,
      [a.doctor_user_id, a.patient_id, 'Ertangi uchrashuv', `${a.full_name} - ${a.appointment_time}`]
    );
  }

  res.json({ message: `${appts.rows.length} ta eslatma yaratildi` });
});

module.exports = router;
