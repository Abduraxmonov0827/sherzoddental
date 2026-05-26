const express = require('express');
const { query } = require('../config/db');
const { authenticate, requireAdmin, ensurePatientAccess } = require('../middleware/auth');
const { addTimelineEvent } = require('../utils/timeline');

const router = express.Router();

const patientFilter = (user) => {
  if (user.role === 'admin') return { clause: '', params: [] };
  return { clause: 'WHERE p.assigned_doctor_id = $1', params: [user.doctor_id] };
};

router.get('/', authenticate, async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  const filter = patientFilter(req.user);
  let searchClause = '';
  const params = [...filter.params];

  if (search) {
    const idx = params.length + 1;
    searchClause = filter.clause ? ' AND' : ' WHERE';
    searchClause += ` (p.full_name ILIKE $${idx} OR p.phone ILIKE $${idx})`;
    params.push(`%${search}%`);
  }

  try {
    const countRes = await query(
      `SELECT COUNT(*)::int FROM patients p ${filter.clause}${searchClause}`,
      params
    );
    const listParams = [...params, limit, offset];
    const result = await query(
      `SELECT p.*, d.full_name as doctor_name
       FROM patients p
       LEFT JOIN doctors d ON d.id = p.assigned_doctor_id
       ${filter.clause}${searchClause}
       ORDER BY p.created_at DESC
       LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
      listParams
    );
    res.json({
      data: result.rows,
      total: countRes.rows[0].count,
      page: parseInt(page),
      totalPages: Math.ceil(countRes.rows[0].count / limit),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
});

router.get('/:id', authenticate, ensurePatientAccess, async (req, res) => {
  const result = await query(
    `SELECT p.*, d.full_name as doctor_name, d.id as doctor_id
     FROM patients p LEFT JOIN doctors d ON d.id = p.assigned_doctor_id
     WHERE p.id = $1`,
    [req.params.id]
  );
  if (!result.rows[0]) return res.status(404).json({ message: 'Mijoz topilmadi' });
  res.json(result.rows[0]);
});

router.get('/:id/full', authenticate, ensurePatientAccess, async (req, res) => {
  const id = req.params.id;
  const [patient, chart, notes, plans, payments, timeline] = await Promise.all([
    query(`SELECT p.*, d.full_name as doctor_name FROM patients p
           LEFT JOIN doctors d ON d.id = p.assigned_doctor_id WHERE p.id = $1`, [id]),
    query('SELECT * FROM dental_chart WHERE patient_id = $1 ORDER BY tooth_number', [id]),
    query(
      `SELECT n.*, d.full_name as doctor_name FROM doctor_notes n
       JOIN doctors d ON d.id = n.doctor_id WHERE n.patient_id = $1 ORDER BY n.created_at DESC`,
      [id]
    ),
    query(
      `SELECT tp.*, d.full_name as doctor_name FROM treatment_plans tp
       JOIN doctors d ON d.id = tp.doctor_id WHERE tp.patient_id = $1 ORDER BY tp.stage_order, tp.created_at`,
      [id]
    ),
    query('SELECT * FROM payments WHERE patient_id = $1 ORDER BY payment_date DESC', [id]),
    query('SELECT * FROM timeline_events WHERE patient_id = $1 ORDER BY created_at DESC', [id]),
  ]);

  if (!patient.rows[0]) return res.status(404).json({ message: 'Mijoz topilmadi' });

  const totalCost = plans.rows.reduce((s, p) => s + parseFloat(p.price || 0), 0);
  const totalPaid = payments.rows.reduce((s, p) => s + parseFloat(p.amount || 0), 0);

  res.json({
    patient: patient.rows[0],
    dentalChart: chart.rows,
    notes: notes.rows,
    treatmentPlans: plans.rows,
    payments: payments.rows,
    timeline: timeline.rows,
    paymentSummary: {
      totalCost,
      totalPaid,
      debt: Math.max(0, totalCost - totalPaid),
    },
  });
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { full_name, phone, age, gender, address, allergy, medical_history, assigned_doctor_id } = req.body;
  try {
    const result = await query(
      `INSERT INTO patients (full_name, phone, age, gender, address, allergy, medical_history, assigned_doctor_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [full_name, phone, age, gender, address, allergy, medical_history, assigned_doctor_id]
    );
    await addTimelineEvent(result.rows[0].id, 'registration', 'Ro\'yxatdan o\'tish', `${full_name} klinikaga ro'yxatdan o'tdi`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  if (req.user.role === 'doctor') {
    const check = await query(
      'SELECT id FROM patients WHERE id = $1 AND assigned_doctor_id = $2',
      [req.params.id, req.user.doctor_id]
    );
    if (!check.rows[0] && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Ruxsat yo\'q' });
    }
  }
  const { full_name, phone, age, gender, address, allergy, medical_history, assigned_doctor_id } = req.body;
  const result = await query(
    `UPDATE patients SET full_name=$1, phone=$2, age=$3, gender=$4, address=$5,
      allergy=$6, medical_history=$7,
      assigned_doctor_id=COALESCE($8, assigned_doctor_id), updated_at=NOW()
     WHERE id=$9 RETURNING *`,
    [full_name, phone, age, gender, address, allergy, medical_history, assigned_doctor_id, req.params.id]
  );
  if (!result.rows[0]) return res.status(404).json({ message: 'Mijoz topilmadi' });
  res.json(result.rows[0]);
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  await query('DELETE FROM patients WHERE id = $1', [req.params.id]);
  res.json({ message: 'Mijoz o\'chirildi' });
});

module.exports = router;
