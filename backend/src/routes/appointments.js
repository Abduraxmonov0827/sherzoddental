const express = require('express');
const { query } = require('../config/db');
const { authenticate, requireAdmin, ensurePatientAccess } = require('../middleware/auth');
const { addTimelineEvent } = require('../utils/timeline');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  const { status, date, doctor_id, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];

  if (req.user.role === 'doctor') {
    params.push(req.user.doctor_id);
    conditions.push(`a.doctor_id = $${params.length}`);
  } else if (doctor_id) {
    params.push(doctor_id);
    conditions.push(`a.doctor_id = $${params.length}`);
  }
  if (status) {
    params.push(status);
    conditions.push(`a.status = $${params.length}`);
  }
  if (date) {
    params.push(date);
    conditions.push(`a.appointment_date = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const result = await query(
      `SELECT a.*, p.full_name as patient_name, p.phone as patient_phone,
              d.full_name as doctor_name
       FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       JOIN doctors d ON d.id = a.doctor_id
       ${where}
       ORDER BY a.appointment_date DESC, a.appointment_time DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { patient_id, doctor_id, appointment_date, appointment_time, status, notes } = req.body;
  try {
    const result = await query(
      `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status, notes)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [patient_id, doctor_id, appointment_date, appointment_time, status || 'kutilmoqda', notes]
    );
    await addTimelineEvent(patient_id, 'appointment', 'Uchrashuv belgilandi', `${appointment_date} ${appointment_time}`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  const { status, appointment_date, appointment_time, notes } = req.body;
  let filter = '';
  const params = [status, appointment_date, appointment_time, notes, req.params.id];

  if (req.user.role === 'doctor') {
    filter = ' AND doctor_id = $6';
    params.push(req.user.doctor_id);
  }

  const result = await query(
    `UPDATE appointments SET status=COALESCE($1,status), appointment_date=COALESCE($2,appointment_date),
      appointment_time=COALESCE($3,appointment_time), notes=COALESCE($4,notes), updated_at=NOW()
     WHERE id=$5${filter} RETURNING *`,
    params
  );
  if (!result.rows[0]) return res.status(404).json({ message: 'Uchrashuv topilmadi' });
  res.json(result.rows[0]);
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  await query('DELETE FROM appointments WHERE id = $1', [req.params.id]);
  res.json({ message: 'Uchrashuv o\'chirildi' });
});

module.exports = router;
