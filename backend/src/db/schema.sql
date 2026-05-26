-- Stomatologiya klinikasi boshqaruv tizimi - PostgreSQL schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('admin', 'doctor');
CREATE TYPE gender_type AS ENUM ('erkak', 'ayol');
CREATE TYPE appointment_status AS ENUM (
  'kutilmoqda', 'tasdiqlangan', 'davolanishda', 'tugallangan', 'bekor_qilingan'
);
CREATE TYPE treatment_plan_status AS ENUM (
  'rejalashtirilgan', 'jarayonda', 'tugallangan', 'bekor_qilingan'
);
CREATE TYPE treatment_priority AS ENUM ('past', 'o''rta', 'yuqori', 'shoshilinch');
CREATE TYPE notification_type AS ENUM (
  'appointment_reminder', 'missed_appointment', 'treatment_reminder'
);
CREATE TYPE tooth_condition AS ENUM (
  'karies', 'sinib_qolgan', 'yoqolgan', 'infeksiya', 'root_damage',
  'gum_disease', 'crown_kerak', 'implant_kerak', 'extraction_kerak', 'sog_lom'
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  login VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  specialty VARCHAR(255),
  work_days JSONB DEFAULT '[]',
  work_start TIME DEFAULT '09:00',
  work_end TIME DEFAULT '18:00',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  age INTEGER,
  gender gender_type,
  address TEXT,
  allergy TEXT,
  medical_history TEXT,
  assigned_doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  registered_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status appointment_status DEFAULT 'kutilmoqda',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE dental_chart (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  tooth_number INTEGER NOT NULL,
  condition tooth_condition DEFAULT 'sog_lom',
  diagnosis TEXT,
  doctor_id UUID REFERENCES doctors(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(patient_id, tooth_number)
);

CREATE TABLE doctor_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  diagnosis TEXT,
  symptoms TEXT,
  observation TEXT,
  additional_conditions TEXT,
  internal_notes TEXT,
  prescription TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE treatment_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  treatment_type VARCHAR(100) NOT NULL,
  tooth_number INTEGER,
  priority treatment_priority DEFAULT 'o''rta',
  price DECIMAL(12, 2) DEFAULT 0,
  status treatment_plan_status DEFAULT 'rejalashtirilgan',
  start_date DATE,
  end_date DATE,
  doctor_notes TEXT,
  stage_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  treatment_plan_id UUID REFERENCES treatment_plans(id) ON DELETE SET NULL,
  amount DECIMAL(12, 2) NOT NULL,
  payment_date DATE DEFAULT CURRENT_DATE,
  payment_method VARCHAR(50) DEFAULT 'naqd',
  invoice_number VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE timeline_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_patients_doctor ON patients(assigned_doctor_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_treatment_plans_patient ON treatment_plans(patient_id);
CREATE INDEX idx_payments_patient ON payments(patient_id);
CREATE INDEX idx_dental_chart_patient ON dental_chart(patient_id);
CREATE INDEX idx_timeline_patient ON timeline_events(patient_id);
