const express = require('express');
const { query } = require('../config/db');
const { authenticate, ensurePatientAccess } = require('../middleware/auth');
const { addTimelineEvent } = require('../utils/timeline');

const router = express.Router();

router.get('/:patientId', authenticate, ensurePatientAccess, async (req, res) => {
  const result = await query(
    `SELECT tp.*, d.full_name as doctor_name FROM treatment_plans tp
     JOIN doctors d ON d.id = tp.doctor_id
     WHERE tp.patient_id = $1 ORDER BY tp.stage_order, tp.created_at`,
    [req.params.patientId]
  );
  res.json(result.rows);
});

router.post('/:patientId', authenticate, ensurePatientAccess, async (req, res) => {
  const {
    treatment_type, tooth_number, priority, price, status,
    start_date, end_date, doctor_notes, stage_order,
  } = req.body;
  const doctorId = req.user.role === 'doctor' ? req.user.doctor_id : req.body.doctor_id;

  const result = await query(
    `INSERT INTO treatment_plans (patient_id, doctor_id, treatment_type, tooth_number,
      priority, price, status, start_date, end_date, doctor_notes, stage_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [req.params.patientId, doctorId, treatment_type, tooth_number, priority || 'o\'rta',
      price || 0, status || 'rejalashtirilgan', start_date, end_date, doctor_notes, stage_order || 1]
  );
  await addTimelineEvent(req.params.patientId, 'treatment', 'Davolash rejasi qo\'shildi', treatment_type);
  res.status(201).json(result.rows[0]);
});

router.put('/:id', authenticate, async (req, res) => {
  const fields = ['treatment_type', 'tooth_number', 'priority', 'price', 'status', 'start_date', 'end_date', 'doctor_notes', 'stage_order'];
  const updates = [];
  const params = [];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) {
      params.push(req.body[f]);
      updates.push(`${f} = $${params.length}`);
    }
  });
  if (!updates.length) return res.status(400).json({ message: 'Yangilash uchun ma\'lumot yo\'q' });

  const idParam = params.length + 1;
  params.push(req.params.id);

  let filter = '';
  if (req.user.role === 'doctor') {
    params.push(req.user.doctor_id);
    filter = ` AND doctor_id = $${params.length}`;
  }

  const result = await query(
    `UPDATE treatment_plans SET ${updates.join(', ')}, updated_at=NOW()
     WHERE id = $${idParam}${filter} RETURNING *`,
    params
  );
  if (!result.rows[0]) return res.status(404).json({ message: 'Reja topilmadi' });
  res.json(result.rows[0]);
});

router.delete('/:id', authenticate, async (req, res) => {
  let filter = '';
  const params = [req.params.id];
  if (req.user.role === 'doctor') {
    params.push(req.user.doctor_id);
    filter = ' AND doctor_id = $2';
  }
  await query(`DELETE FROM treatment_plans WHERE id = $1${filter}`, params);
  res.json({ message: 'Reja o\'chirildi' });
});

module.exports = router;
