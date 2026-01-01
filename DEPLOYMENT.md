# 🚀 Panduan Deployment TokoKu

## Opsi 1: Railway (Backend) + Vercel (Frontend) - RECOMMENDED ⭐

### A. Deploy Backend ke Railway

1. **Daftar di Railway**

   - Buka [railway.app](https://railway.app)
   - Sign in dengan GitHub

2. **Buat Project Baru**

   - Klik "New Project"
   - Pilih "Deploy from GitHub repo"
   - Pilih repository `zeinmhasan/proyek-toko`
   - Railway akan auto-detect folder `backend`

3. **Tambah PostgreSQL Database**

   - Klik "New" → "Database" → "Add PostgreSQL"
   - Database akan auto-create dengan `DATABASE_URL`

4. **Set Environment Variables**

   - Buka Settings → Variables
   - Tambahkan:

   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}  (auto-filled)
   JWT_SECRET=buatRandomString32Karakter
   JWT_REFRESH_SECRET=buatRandomStringLain32Karakter
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   NODE_ENV=production
   PORT=3001
   FRONTEND_URL=https://your-app.vercel.app (isi nanti setelah deploy frontend)
   ```

5. **Configure Build**

   - Settings → Build Command: `npm run db:generate && npm run build`
   - Start Command: `npm start`
   - Root Directory: `backend`

6. **Deploy!**

   - Railway akan auto-deploy
   - Copy URL backend (contoh: `https://proyek-toko-production.up.railway.app`)

7. **Run Migration (Penting!)**

   - Buka tab "Service" → klik backend service
   - Masuk ke "Variables" tab
   - Klik icon "Deploy" dan tunggu selesai
   - Kemudian buka "Deployments" → klik deployment terakhir
   - Klik "View Logs"
   - Jika sudah running, buka Railway CLI atau gunakan Database Query:

   **Alternatif: Manual Migration via Railway CLI**

   ```bash
   # Install Railway CLI
   npm i -g @railway/cli

   # Login
   railway login

   # Link project
   railway link

   # Run migrations
   railway run npm run db:migrate

   # Seed database (optional)
   railway run npm run db:seed
   ```

### B. Deploy Frontend ke Vercel

1. **Daftar di Vercel**

   - Buka [vercel.com](https://vercel.com)
   - Sign in dengan GitHub

2. **Import Project**

   - Klik "Add New..." → "Project"
   - Import repository `zeinmhasan/proyek-toko`

3. **Configure Project**

   - Framework Preset: **Vite**
   - Root Directory: **frontend**
   - Build Command: `npm run build` (default)
   - Output Directory: `dist` (default)

4. **Set Environment Variables**

   ```
   VITE_API_URL=https://proyek-toko-production.up.railway.app
   ```

   (ganti dengan URL Railway backend Anda)

5. **Deploy!**

   - Klik "Deploy"
   - Tunggu beberapa menit
   - Copy URL frontend (contoh: `https://proyek-toko.vercel.app`)

6. **Update Backend CORS**
   - Kembali ke Railway
   - Update variable `FRONTEND_URL` dengan URL Vercel Anda
   - Redeploy backend

---

## Opsi 2: Render (All-in-One)

### A. Deploy Backend

1. **Daftar di Render**

   - Buka [render.com](https://render.com)
   - Sign in dengan GitHub

2. **Buat PostgreSQL Database**

   - Dashboard → New → PostgreSQL
   - Name: `tokoku-db`
   - Free tier
   - Create Database
   - Copy "Internal Database URL"

3. **Deploy Backend Service**

   - Dashboard → New → Web Service
   - Connect repository `zeinmhasan/proyek-toko`
   - Configure:
     ```
     Name: tokoku-backend
     Root Directory: backend
     Environment: Node
     Build Command: npm install && npm run db:generate && npm run build
     Start Command: npm start
     Instance Type: Free
     ```

4. **Environment Variables**

   ```
   DATABASE_URL=<Internal Database URL dari step 2>
   JWT_SECRET=buatRandomString32Karakter
   JWT_REFRESH_SECRET=buatRandomStringLain32Karakter
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   NODE_ENV=production
   PORT=3001
   FRONTEND_URL=https://tokoku-frontend.onrender.com (isi nanti)
   ```

5. **Deploy & Run Migration**
   - Setelah deploy selesai, buka "Shell" tab
   - Run: `npm run db:migrate`
   - Run: `npm run db:seed` (optional)

### B. Deploy Frontend

1. **Buat Static Site**

   - Dashboard → New → Static Site
   - Connect repository `zeinmhasan/proyek-toko`
   - Configure:
     ```
     Name: tokoku-frontend
     Root Directory: frontend
     Build Command: npm run build
     Publish Directory: dist
     ```

2. **Environment Variables**

   ```
   VITE_API_URL=https://tokoku-backend.onrender.com
   ```

3. **Deploy!**

---

## Opsi 3: Netlify (Frontend Alternative)

1. **Daftar di Netlify**

   - [netlify.com](https://netlify.com)
   - Sign in dengan GitHub

2. **Import Site**

   - Add new site → Import existing project
   - Connect GitHub → pilih repo

3. **Configure**

   ```
   Base directory: frontend
   Build command: npm run build
   Publish directory: frontend/dist
   ```

4. **Environment Variables**
   ```
   VITE_API_URL=<backend URL>
   ```

---

## ⚠️ Checklist Setelah Deploy

- [ ] Test login dengan akun admin default
- [ ] Ganti password admin
- [ ] Test semua fitur utama (POS, Inventory, Finance)
- [ ] Pastikan CORS settings benar
- [ ] Monitor logs untuk error
- [ ] Setup custom domain (optional)
- [ ] Enable HTTPS (biasanya auto)

---

## 🔧 Troubleshooting

### Database Connection Error

- Pastikan `DATABASE_URL` sudah benar
- Check format: `postgresql://user:password@host:port/database`
- Pastikan database sudah di-migrate

### CORS Error

- Periksa `FRONTEND_URL` di backend env vars
- Pastikan tidak ada trailing slash
- Check browser console untuk detail error

### Build Failed

- Check logs untuk error spesifik
- Pastikan semua dependencies di `package.json`
- Verify Node version compatibility

### 500 Internal Server Error

- Check backend logs
- Verify environment variables
- Ensure database migrations are run

---

## 📞 Support

Jika ada masalah, check:

1. Railway/Render/Vercel logs
2. Browser console untuk frontend errors
3. Network tab untuk API errors

Good luck! 🚀
