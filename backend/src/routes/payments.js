const express = require('express');
const { query } = require('../config/db');
const { authenticate, ensurePatientAccess } = require('../middleware/auth');
const { addTimelineEvent } = require('../utils/timeline');

const router = express.Router();

router.get('/:patientId', authenticate, ensurePatientAccess, async (req, res) => {
  const payments = await query(
    'SELECT * FROM payments WHERE patient_id = $1 ORDER BY payment_date DESC',
    [req.params.patientId]
  );
  const plans = await query(
    'SELECT COALESCE(SUM(price), 0)::float as total FROM treatment_plans WHERE patient_id = $1',
    [req.params.patientId]
  );
  const paid = payments.rows.reduce((s, p) => s + parseFloat(p.amount), 0);
  const totalCost = parseFloat(plans.rows[0].total);

  res.json({
    payments: payments.rows,
    summary: { totalCost, totalPaid: paid, debt: Math.max(0, totalCost - paid) },
  });
});

router.post('/:patientId', authenticate, async (req, res) => {
  const { amount, payment_date, payment_method, treatment_plan_id, notes } = req.body;
  const invoice = `INV-${Date.now()}`;
  const result = await query(
    `INSERT INTO payments (patient_id, treatment_plan_id, amount, payment_date, payment_method, invoice_number, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [req.params.patientId, treatment_plan_id, amount, payment_date || new Date(), payment_method || 'naqd', invoice, notes]
  );
  await addTimelineEvent(req.params.patientId, 'payment', 'To\'lov qabul qilindi', `${amount} so'm`, { invoice });
  res.status(201).json(result.rows[0]);
});

module.exports = router;
