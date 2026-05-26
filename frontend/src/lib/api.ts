import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

export const STATUS_LABELS: Record<string, string> = {
  kutilmoqda: 'Kutilmoqda',
  tasdiqlangan: 'Tasdiqlangan',
  davolanishda: 'Davolanishda',
  tugallangan: 'Tugallangan',
  bekor_qilingan: 'Bekor qilingan',
  rejalashtirilgan: 'Rejalashtirilgan',
  jarayonda: 'Jarayonda',
};

export const TREATMENT_TYPES = [
  'Tish olish', 'Karonka', 'Implant', 'Plomba', 'Root canal',
  'Tozalash', 'Breket', 'Oqartirish', 'Jarrohlik', 'Milk davolash', 'Veneer',
];

export const TOOTH_CONDITIONS: Record<string, string> = {
  karies: 'Karies',
  sinib_qolgan: 'Sinib qolgan tish',
  yoqolgan: 'Yo\'qolgan tish',
  infeksiya: 'Infeksiya',
  root_damage: 'Root damage',
  gum_disease: 'Gum disease',
  crown_kerak: 'Karonka kerak',
  implant_kerak: 'Implant kerak',
  extraction_kerak: 'Olish kerak',
  sog_lom: 'Sog\'lom',
};

export const CONDITION_COLORS: Record<string, string> = {
  karies: '#f59e0b',
  sinib_qolgan: '#ef4444',
  yoqolgan: '#6b7280',
  infeksiya: '#dc2626',
  root_damage: '#b91c1c',
  gum_disease: '#ec4899',
  crown_kerak: '#8b5cf6',
  implant_kerak: '#3b82f6',
  extraction_kerak: '#1f2937',
  sog_lom: '#22c55e',
};
