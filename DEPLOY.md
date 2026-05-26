# DentalPro — Bepul serverlarga deploy qo'llanmasi

Ushbu loyiha **3 ta bepul xizmat**da ishlaydi:

| Qism | Xizmat | Nima uchun |
|------|--------|------------|
| **Ma'lumotlar bazasi** | [Neon](https://neon.tech) | PostgreSQL, bepul, uyqu rejimi yo'q |
| **Backend (API)** | [Render](https://render.com) | Node.js / Express |
| **Frontend (sayt)** | [Vercel](https://vercel.com) | Next.js uchun eng qulay |

Siz **domen**ni o'zingiz sotib olasiz va Vercel/Render ga ulaysiz.

---

## 0-qadam: GitHub ga yuklash

Render va Vercel GitHub orqali ishlaydi.

1. [github.com](https://github.com) da yangi repository yarating (masalan: `dental-clinic`)
2. Loyihani yuklang:

```bash
cd "d:\Paid projects\SHERZOD AKA"
git init
git add .
git commit -m "DentalPro stomatologiya tizimi"
git branch -M main
git remote add origin https://github.com/SIZNING_USERNAME/dental-clinic.git
git push -u origin main
```

> `.env` va `.env.local` fayllar `.gitignore` da — GitHub ga ketmaydi (xavfsiz).

---

## 1-qadam: PostgreSQL — Neon.tech (BEPUL)

1. [neon.tech](https://neon.tech) → **Sign up** (GitHub bilan ham bo'ladi)
2. **New Project** → nom: `dental-clinic`
3. **Connection string** ni nusxalang (Pooled connection tavsiya etiladi):
   ```
   postgresql://user:password@ep-xxxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Bu URL ni saqlang — Render da `DATABASE_URL` sifatida ishlatiladi

### Jadvallar va demo ma'lumotlar (birinchi marta)

Kompyuteringizda (loyiha papkasida):

```bash
cd backend
# .env ichiga Neon URL ni yozing:
# DATABASE_URL=postgresql://...

npm run db:setup
```

Yoki Render deploy dan keyin **Shell** orqali (2-qadamdan keyin):

```bash
npm run db:seed
```

---

## 2-qadam: Backend API — Render.com (BEPUL)

1. [render.com](https://render.com) → **Get Started** (GitHub ulang)
2. **New +** → **Blueprint** (yoki **Web Service**)
3. GitHub repozitoriyangizni tanlang
4. `render.yaml` avtomatik topiladi → **Apply**

### Qo'lda sozlash (Blueprint ishlmasa)

| Sozlama | Qiymat |
|---------|--------|
| Root Directory | `backend` |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |
| Health Check Path | `/api/health` |

### Environment Variables (Render → Environment)

| Kalit | Qiymat |
|-------|--------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Neon dan nusxalangan URL |
| `JWT_SECRET` | Tasodifiy uzun matn (min 32 belgi) |
| `JWT_EXPIRES_IN` | `7d` |
| `FRONTEND_URL` | Hozircha bo'sh; Vercel deploy dan keyin qo'shasiz |

**Deploy** tugmasini bosing. 5–10 daqiqadan keyin API manzili chiqadi:

```
https://dental-clinic-api.onrender.com
```

Tekshirish: brauzerda oching → `https://SIZNING-API.onrender.com/api/health`

### Demo hisoblarni yaratish (bir marta)

Render → servisingiz → **Shell**:

```bash
npm run db:seed
```

---

## 3-qadam: Frontend — Vercel.com (BEPUL)

1. [vercel.com](https://vercel.com) → **Sign up** (GitHub)
2. **Add New → Project** → repozitoriyani tanlang
3. Sozlamalar:

| Sozlama | Qiymat |
|---------|--------|
| **Root Directory** | `frontend` (Edit tugmasi) |
| Framework | Next.js (avtomatik) |

4. **Environment Variables**:

| Kalit | Qiymat |
|-------|--------|
| `NEXT_PUBLIC_API_URL` | `https://SIZNING-API.onrender.com/api` |

5. **Deploy** — 2–3 daqiqada sayt tayyor:

```
https://dental-clinic-xxx.vercel.app
```

### Render CORS ni yangilash

Render → Environment → `FRONTEND_URL` ga qo'shing:

```
https://dental-clinic-xxx.vercel.app
```

Keyin **Manual Deploy** yoki avtomatik qayta deploy.

---

## 4-qadam: O'z domeningizni ulash

### Frontend (asosiy sayt) — Vercel

1. Domen provayderingizda (masalan: `sizning-klinika.uz`):
   - **A yozuvi** → `76.76.21.21` (Vercel IP — Vercel dashboard da ko'rsatiladi)
   - yoki **CNAME** → `cname.vercel-dns.com`

2. Vercel → Project → **Settings → Domains** → domeningizni kiriting
3. Vercel ko'rsatmalariga amal qiling (DNS tasdiqlanishi 5–48 soat)

4. Render da `FRONTEND_URL` ga yangi domen qo'shing:
   ```
   https://sizning-klinika.uz,https://www.sizning-klinika.uz
   ```

### API uchun subdomain (ixtiyoriy)

Masalan: `api.sizning-klinika.uz`

1. Render → Settings → **Custom Domain** → `api.sizning-klinika.uz`
2. DNS da **CNAME** → Render bergan manzil
3. Vercel da `NEXT_PUBLIC_API_URL` ni yangilang:
   ```
   https://api.sizning-klinika.uz/api
   ```

---

## Tekshirish ro'yxati

- [ ] `https://API.onrender.com/api/health` → `{"status":"ok"}`
- [ ] Login: `admin` / `admin123`
- [ ] Doctor: `sherzod` / `doctor123`
- [ ] Mijozlar, uchrashuvlar ishlaydi

---

## Muhim eslatmalar

### Render bepul rejim
- **15 daqiqa** harakatsizlikdan keyin API "uxlaydi"
- Birinchi so'rov 30–60 soniya kutishi mumkin (cold start)
- Doimiy tez ishlashi uchun: Render paid yoki [UptimeRobot](https://uptimerobot.com) bilan har 10 daqiqada `/api/health` ga ping

### Xavfsizlik (production)
- `admin123` / `doctor123` parollarni **o'zgartiring** (admin panel orqali yoki DB da)
- `JWT_SECRET` ni hech kimga bermang
- Neon dashboard da faqat kerakli IP cheklash (ixtiyoriy)

### Yangilash
GitHub ga `git push` qilsangiz — Vercel va Render avtomatik qayta deploy qiladi.

---

## Muammo hal qilish

| Muammo | Yechim |
|--------|--------|
| Login ishlamaydi | `NEXT_PUBLIC_API_URL` to'g'rimi? Oxirida `/api` bormi? |
| CORS xatosi | Render `FRONTEND_URL` da Vercel/domen URL to'liq `https://` bilan |
| DB ulanmaydi | Neon URL da `?sslmode=require` borligini tekshiring |
| 502 / timeout | Render cold start — 1 daqiqa kutib qayta urining |
| Jadvallar yo'q | `npm run db:setup` yoki Render Shell da `npm run db:migrate` |

---

## Xarajatlar (bepul limitlar)

| Xizmat | Bepul limit (taxminan) |
|--------|------------------------|
| Neon | 0.5 GB storage, cheksiz loyiha |
| Render | 750 soat/oy, 512 MB RAM |
| Vercel | 100 GB bandwidth/oy |

Klinika uchun boshlang'ichda yetarli.

---

## Qisqa sxema

```
Foydalanuvchi
    ↓
[sizning-domen.uz]  ← Vercel (Frontend)
    ↓ API so'rovlari
[api.onrender.com]  ← Render (Backend)
    ↓
[Neon PostgreSQL]   ← Ma'lumotlar bazasi
```

Savollar bo'lsa — `README.md` va `.env.production.example` fayllariga qarang.
