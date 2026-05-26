require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const doctorRoutes = require('./routes/doctors');
const patientRoutes = require('./routes/patients');
const appointmentRoutes = require('./routes/appointments');
const dentalChartRoutes = require('./routes/dentalChart');
const noteRoutes = require('./routes/notes');
const treatmentPlanRoutes = require('./routes/treatmentPlans');
const paymentRoutes = require('./routes/payments');
const notificationRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 5000;

function getAllowedOrigins() {
  const origins = new Set(['http://localhost:3000']);
  (process.env.FRONTEND_URL || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
    .forEach((o) => origins.add(o));
  if (process.env.VERCEL_URL) origins.add(`https://${process.env.VERCEL_URL}`);
  return [...origins];
}

const allowedOrigins = getAllowedOrigins();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: ${origin} ruxsat etilmagan`));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

app.get('/api/health', (_, res) => res.json({ status: 'ok', message: 'Dental Clinic API ishlayapti' }));

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/dental-chart', dentalChartRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/treatment-plans', treatmentPlanRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Ichki server xatosi' });
});

app.listen(PORT, () => {
  console.log(`🦷 Dental Clinic API: http://localhost:${PORT}`);
});
