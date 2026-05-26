const express = require('express');
const { query } = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/admin', authenticate, requireAdmin, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [patients, doctors, todayAppts, completed, pending, revenue] = await Promise.all([
      query('SELECT COUNT(*)::int as count FROM patients'),
      query('SELECT COUNT(*)::int as count FROM doctors WHERE is_active = true'),
      query(
        `SELECT COUNT(*)::int as count FROM appointments WHERE appointment_date = $1`,
        [today]
      ),
      query(
        `SELECT COUNT(*)::int as count FROM treatment_plans WHERE status = 'tugallangan'`
      ),
      query(
        `SELECT COUNT(*)::int as count FROM treatment_plans WHERE status IN ('rejalashtirilgan', 'jarayonda')`
      ),
      query('SELECT COALESCE(SUM(amount), 0)::float as total FROM payments'),
    ]);

    const monthlyRevenue = await query(
      `SELECT TO_CHAR(payment_date, 'YYYY-MM') as month,
              SUM(amount)::float as total
       FROM payments
       WHERE payment_date >= CURRENT_DATE - INTERVAL '6 months'
       GROUP BY month ORDER BY month`
    );

    const appointmentsByStatus = await query(
      `SELECT status, COUNT(*)::int as count FROM appointments GROUP BY status`
    );

    const recentAppointments = await query(
      `SELECT a.*, p.full_name as patient_name, d.full_name as doctor_name
       FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       JOIN doctors d ON d.id = a.doctor_id
       ORDER BY a.appointment_date DESC, a.appointment_time DESC LIMIT 10`
    );

    res.json({
      stats: {
        totalPatients: patients.rows[0].count,
        totalDoctors: doctors.rows[0].count,
        todayAppointments: todayAppts.rows[0].count,
        completedTreatments: completed.rows[0].count,
        pendingTreatments: pending.rows[0].count,
        totalRevenue: revenue.rows[0].total,
      },
      monthlyRevenue: monthlyRevenue.rows,
      appointmentsByStatus: appointmentsByStatus.rows,
      recentAppointments: recentAppointments.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server xatosi' });
  }
});

router.get('/doctor', authenticate, async (req, res) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ message: 'Faqat doctor uchun' });
  }
  const doctorId = req.user.doctor_id;
  const today = new Date().toISOString().split('T')[0];

  try {
    const [todayPatients, upcoming, completed, schedule] = await Promise.all([
      query(
        `SELECT COUNT(DISTINCT a.patient_id)::int as count
         FROM appointments a WHERE a.doctor_id = $1 AND a.appointment_date = $2`,
        [doctorId, today]
      ),
      query(
        `SELECT a.*, p.full_name as patient_name, p.phone as patient_phone
         FROM appointments a
         JOIN patients p ON p.id = a.patient_id
         WHERE a.doctor_id = $1 AND a.appointment_date >= $2
           AND a.status NOT IN ('tugallangan', 'bekor_qilingan')
         ORDER BY a.appointment_date, a.appointment_time LIMIT 10`,
        [doctorId, today]
      ),
      query(
        `SELECT COUNT(*)::int as count FROM treatment_plans
         WHERE doctor_id = $1 AND status = 'tugallangan'`,
        [doctorId]
      ),
      query(
        `SELECT work_days, work_start, work_end FROM doctors WHERE id = $1`,
        [doctorId]
      ),
    ]);

    const myPatients = await query(
      `SELECT COUNT(*)::int as count FROM patients WHERE assigned_doctor_id = $1`,
      [doctorId]
    );

    res.json({
      stats: {
        todayPatients: todayPatients.rows[0].count,
        totalPatients: myPatients.rows[0].count,
        completedTreatments: completed.rows[0].count,
      },
      upcomingAppointments: upcoming.rows,
      schedule: schedule.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server xatosi' });
  }
});

module.exports = router;
