const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Avtorizatsiya talab qilinadi' });
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userRes = await query(
      `SELECT u.id, u.login, u.role, d.id as doctor_id, d.full_name as doctor_name
       FROM users u
       LEFT JOIN doctors d ON d.user_id = u.id
       WHERE u.id = $1`,
      [decoded.userId]
    );
    if (!userRes.rows[0]) {
      return res.status(401).json({ message: 'Foydalanuvchi topilmadi' });
    }
    req.user = userRes.rows[0];
    next();
  } catch {
    return res.status(401).json({ message: 'Yaroqsiz yoki muddati o\'tgan token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Faqat admin uchun ruxsat' });
  }
  next();
};

const requireDoctor = (req, res, next) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ message: 'Faqat doctor uchun ruxsat' });
  }
  next();
};

const ensurePatientAccess = async (req, res, next) => {
  const patientId = req.params.patientId || req.params.id;
  if (!patientId) return next();

  if (req.user.role === 'admin') return next();

  const res2 = await query(
    'SELECT id FROM patients WHERE id = $1 AND assigned_doctor_id = $2',
    [patientId, req.user.doctor_id]
  );
  if (!res2.rows[0]) {
    return res.status(403).json({ message: 'Bu mijozga kirish huquqingiz yo\'q' });
  }
  next();
};

module.exports = { authenticate, requireAdmin, requireDoctor, ensurePatientAccess };
