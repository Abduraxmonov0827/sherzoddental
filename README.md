# DentalPro — Stomatologiya Klinikasi Boshqaruv Tizimi

Professional full-stack stomatologiya klinikasi boshqaruv tizimi. Interfeys to'liq **o'zbek tilida**.

## Texnologiyalar

| Qism | Texnologiya |
|------|-------------|
| Frontend | Next.js 14, React, TailwindCSS, Chart.js |
| Backend | Node.js, Express |
| Ma'lumotlar bazasi | PostgreSQL |

## Imkoniyatlar

- **Admin paneli**: statistika, grafikalar, doctor/mijoz/uchrashuv boshqaruvi
- **Doctor paneli** (Sherzod, Feruza, Baxriddin): alohida login, faqat o'z mijozlari
- **Interaktiv tish diagrammasi** (FDI notation)
- **Plan Lecheniya**, klinik izohlar, to'lovlar, timeline
- **Bildirishnomalar**, qorong'u rejim, responsive dizayn

## O'rnatish

### Tez ishga tushirish (bitta buyruq)

Docker Desktop ochiq bo'lishi kerak:

```bash
npm install          # ildiz papkada (birinchi marta)
cd backend && npm install && cd ../frontend && npm install && cd ..
npm start            # DB + API + sayt birga ishga tushadi
```

- Sayt: http://localhost:3000
- API: http://localhost:5000

`npm start` avtomatik: PostgreSQL (Docker) → jadvallar → demo ma'lumotlar → backend + frontend.

### Qo'lda ishga tushirish

```bash
docker compose up -d --wait postgres
cd backend && npm run db:migrate && npm run db:seed && npm run dev
# boshqa terminalda:
cd frontend && npm run dev
```

## Demo hisoblar

| Rol | Login | Parol |
|-----|-------|-------|
| Admin | `admin` | `admin123` |
| Doctor Sherzod | `sherzod` | `doctor123` |
| Doctor Feruza | `feruza` | `doctor123` |
| Doctor Baxriddin | `baxriddin` | `doctor123` |

## Loyiha tuzilmasi

```
├── backend/
│   ├── src/
│   │   ├── config/       # DB ulanish
│   │   ├── db/           # schema.sql, migrate, seed
│   │   ├── middleware/   # JWT auth
│   │   ├── routes/       # API endpoints
│   │   └── utils/
│   └── package.json
├── frontend/
│   └── src/
│       ├── app/          # Next.js sahifalar
│       ├── components/   # UI, DentalChart, charts
│       ├── context/      # Auth, Theme
│       └── lib/          # API client
└── README.md
```

## API Endpoints

| Endpoint | Tavsif |
|----------|--------|
| `POST /api/auth/login` | Kirish |
| `GET /api/dashboard/admin` | Admin statistika |
| `GET /api/dashboard/doctor` | Doctor statistika |
| `CRUD /api/doctors` | Doctorlar |
| `CRUD /api/patients` | Mijozlar |
| `CRUD /api/appointments` | Uchrashuvlar |
| `PUT /api/dental-chart/:patientId/:tooth` | Tish diagrammasi |
| `POST /api/notes/:patientId` | Klinik izohlar |
| `CRUD /api/treatment-plans/:patientId` | Plan Lecheniya |
| `POST /api/payments/:patientId` | To'lovlar |
| `GET /api/notifications` | Bildirishnomalar |

## Xavfsizlik

- JWT token autentifikatsiya
- Doctor faqat o'z `assigned_doctor_id` mijozlariga kiradi
- Parollar bcrypt bilan hashlangan

## Production (bepul deploy)

To'liq qo'llanma: **[DEPLOY.md](./DEPLOY.md)**

| Qism | Xizmat |
|------|--------|
| Database | Neon.tech |
| Backend | Render.com |
| Frontend | Vercel.com |

Domeningizni Vercel ga ulang, API uchun Render `FRONTEND_URL` ni yangilang.
