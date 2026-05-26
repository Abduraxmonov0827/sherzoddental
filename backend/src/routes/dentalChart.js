const express = require('express');
const { query } = require('../config/db');
const { authenticate, ensurePatientAccess } = require('../middleware/auth');
const { addTimelineEvent } = require('../utils/timeline');

const router = express.Router();

router.get('/:patientId', authenticate, ensurePatientAccess, async (req, res) => {
  const result = await query(
    'SELECT * FROM dental_chart WHERE patient_id = $1 ORDER BY tooth_number',
    [req.params.patientId]
  );
  res.json(result.rows);
});

router.put('/:patientId/:toothNumber', authenticate, ensurePatientAccess, async (req, res) => {
  const { condition, diagnosis } = req.body;
  const doctorId = req.user.doctor_id || req.body.doctor_id;

  const result = await query(
    `INSERT INTO dental_chart (patient_id, tooth_number, condition, diagnosis, doctor_id)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (patient_id, tooth_number)
     DO UPDATE SET condition=$3, diagnosis=$4, doctor_id=$5, updated_at=NOW()
     RETURNING *`,
    [req.params.patientId, parseInt(req.params.toothNumber), condition, diagnosis, doctorId]
  );

  await addTimelineEvent(
    req.params.patientId,
    'dental_chart',
    `${req.params.toothNumber}-tish yangilandi`,
    diagnosis || condition
  );

  res.json(result.rows[0]);
});

module.exports = router;
