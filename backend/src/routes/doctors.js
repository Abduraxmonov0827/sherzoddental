const express = require('express');
const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT d.*, u.login,
        (SELECT COUNT(*)::int FROM patients WHERE assigned_doctor_id = d.id) as patient_count
       FROM doctors d
       JOIN users u ON u.id = d.user_id
       ORDER BY d.full_name`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
});

router.get('/:id', authenticate, requireAdmin, async (req, res) => {
  const result = await query(
    `SELECT d.*, u.login FROM doctors d JOIN users u ON u.id = d.user_id WHERE d.id = $1`,
    [req.params.id]
  );
  if (!result.rows[0]) return res.status(404).json({ message: 'Doctor topilmadi' });
  res.json(result.rows[0]);
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { full_name, phone, specialty, work_days, work_start, work_end, login, password } = req.body;
  const client = await require('../config/db').pool.connect();
  try {
    await client.query('BEGIN');
    const hash = await bcrypt.hash(password || 'doctor123', 12);
    const userRes = await client.query(
      `INSERT INTO users (login, password_hash, role) VALUES ($1, $2, 'doctor') RETURNING id`,
      [login.toLowerCase(), hash]
    );
    const docRes = await client.query(
      `INSERT INTO doctors (user_id, full_name, phone, specialty, work_days, work_start, work_end)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [userRes.rows[0].id, full_name, phone, specialty, JSON.stringify(work_days || []), work_start || '09:00', work_end || '18:00']
    );
    await client.query('COMMIT');
    res.status(201).json(docRes.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') return res.status(400).json({ message: 'Login allaqachon mavjud' });
    res.status(500).json({ message: 'Server xatosi' });
  } finally {
    client.release();
  }
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const { full_name, phone, specialty, work_days, work_start, work_end, login, password, is_active } = req.body;
  try {
    const doc = await query('SELECT user_id FROM doctors WHERE id = $1', [req.params.id]);
    if (!doc.rows[0]) return res.status(404).json({ message: 'Doctor topilmadi' });

    if (login) await query('UPDATE users SET login = $1 WHERE id = $2', [login.toLowerCase(), doc.rows[0].user_id]);
    if (password) {
      const hash = await bcrypt.hash(password, 12);
      await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, doc.rows[0].user_id]);
    }

    const result = await query(
      `UPDATE doctors SET full_name=$1, phone=$2, specialty=$3, work_days=$4,
        work_start=$5, work_end=$6, is_active=COALESCE($7, is_active), updated_at=NOW()
       WHERE id=$8 RETURNING *`,
      [full_name, phone, specialty, JSON.stringify(work_days), work_start, work_end, is_active, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  const doc = await query('SELECT user_id FROM doctors WHERE id = $1', [req.params.id]);
  if (!doc.rows[0]) return res.status(404).json({ message: 'Doctor topilmadi' });
  await query('DELETE FROM users WHERE id = $1', [doc.rows[0].user_id]);
  res.json({ message: 'Doctor o\'chirildi' });
});

router.put('/:id/assign-patient', authenticate, requireAdmin, async (req, res) => {
  const { patient_id } = req.body;
  await query('UPDATE patients SET assigned_doctor_id = $1 WHERE id = $2', [req.params.id, patient_id]);
  res.json({ message: 'Mijoz doctorga biriktirildi' });
});

module.exports = router;
