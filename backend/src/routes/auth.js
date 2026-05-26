const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { login, password } = req.body;
  if (!login || !password) {
    return res.status(400).json({ message: 'Login va parol kiritilishi shart' });
  }

  try {
    const userRes = await query(
      `SELECT u.*, d.id as doctor_id, d.full_name as doctor_name, d.specialty
       FROM users u
       LEFT JOIN doctors d ON d.user_id = u.id
       WHERE u.login = $1`,
      [login.toLowerCase().trim()]
    );
    const user = userRes.rows[0];
    if (!user) {
      return res.status(401).json({ message: 'Login yoki parol noto\'g\'ri' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: 'Login yoki parol noto\'g\'ri' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        login: user.login,
        role: user.role,
        doctorId: user.doctor_id,
        doctorName: user.doctor_name,
        specialty: user.specialty,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server xatosi' });
  }
});

router.get('/me', authenticate, (req, res) => {
  res.json({
    id: req.user.id,
    login: req.user.login,
    role: req.user.role,
    doctorId: req.user.doctor_id,
    doctorName: req.user.doctor_name,
  });
});

module.exports = router;
