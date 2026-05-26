const express = require('express');
const { query } = require('../config/db');
const { authenticate, requireDoctor, ensurePatientAccess } = require('../middleware/auth');
const { addTimelineEvent } = require('../utils/timeline');

const router = express.Router();

router.get('/:patientId', authenticate, ensurePatientAccess, async (req, res) => {
  const result = await query(
    `SELECT n.*, d.full_name as doctor_name FROM doctor_notes n
     JOIN doctors d ON d.id = n.doctor_id
     WHERE n.patient_id = $1 ORDER BY n.created_at DESC`,
    [req.params.patientId]
  );
  res.json(result.rows);
});

router.post('/:patientId', authenticate, requireDoctor, ensurePatientAccess, async (req, res) => {
  const { diagnosis, symptoms, observation, additional_conditions, internal_notes, prescription } = req.body;
  const result = await query(
    `INSERT INTO doctor_notes (patient_id, doctor_id, diagnosis, symptoms, observation,
      additional_conditions, internal_notes, prescription)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [req.params.patientId, req.user.doctor_id, diagnosis, symptoms, observation,
      additional_conditions, internal_notes, prescription]
  );
  await addTimelineEvent(req.params.patientId, 'note', 'Yangi klinik izoh', diagnosis);
  res.status(201).json(result.rows[0]);
});

module.exports = router;
