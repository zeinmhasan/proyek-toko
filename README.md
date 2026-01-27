# TokoKu - Sistem Manajemen Toko

Aplikasi Point of Sale (POS) dan Manajemen Toko yang lengkap dengan fitur inventory, transaksi, hutang piutang, dan laporan keuangan.

## 🚀 Tech Stack

### Backend

- **Node.js** + **Express** + **TypeScript**
- **PostgreSQL** + **Prisma ORM**
- **JWT Authentication**
- **Multer** untuk upload gambar

### Frontend

- **React 18** + **TypeScript**
- **Vite** untuk build tool
- **TailwindCSS** untuk styling
- **React Router** untuk routing
- **Axios** untuk HTTP client

## 📋 Fitur

- ✅ Autentikasi (Login/Register) dengan JWT
- ✅ Dashboard dengan statistik & grafik
- ✅ Manajemen Produk & Kategori
- ✅ Point of Sale (POS) dengan struk digital
- ✅ Manajemen Inventory
- ✅ Laporan Keuangan & Laba Rugi
- ✅ Pencatatan Hutang Piutang
- ✅ User Management (Admin)
- ✅ Profile Management

## 🛠️ Setup Development

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm atau yarn

### 🐳 Menjalankan Database dengan Docker

Proyek ini menggunakan Docker untuk menjalankan database PostgreSQL.

```bash
cd backend

# Jalankan PostgreSQL container
docker-compose up -d

# Cek apakah container berjalan
docker ps
```

Database akan berjalan di port `5433` dengan konfigurasi:

- **Host:** localhost
- **Port:** 5433
- **Database:** tokoku_db
- **Username:** tokoku
- **Password:** tokoku123

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env dengan konfigurasi berikut (untuk Docker):
# DATABASE_URL=postgresql://tokoku:tokoku123@localhost:5433/tokoku_db

# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Seed database dengan data contoh
npm run db:seed

# Start development server
npm run dev
```

### 🌱 Database Seeding

Untuk mengisi database dengan data contoh (produk, kategori, transaksi, dll), jalankan:

```bash
cd backend
npm run db:seed
```

Seed akan membuat:

- **Admin user:** zen@gmail.com / Passzein1
- **Cashier users:** siti@zenresto.com, budi@zenresto.com, dewi@zenresto.com (password: Cashier123)
- **Store settings**
- **Kategori produk**
- **Produk contoh**
- **Transaksi contoh**
- **Data keuangan contoh**

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit VITE_API_URL jika perlu (default: http://localhost:3001)

# Start development server
npm run dev
```

### 🚀 Menjalankan Keseluruhan Proyek

1. **Jalankan Docker untuk database:**

   ```bash
   cd backend && docker-compose up -d
   ```

2. **Jalankan Backend (terminal 1):**

   ```bash
   cd backend && npm run dev
   ```

3. **Jalankan Frontend (terminal 2):**

   ```bash
   cd frontend && npm run dev
   ```

4. **Akses aplikasi:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## 🌐 Deployment

### Backend (Railway/Render)

1. Push code ke GitHub
2. Connect repository di Railway/Render
3. Add PostgreSQL database
4. Set environment variables:
   - `DATABASE_URL` (dari Railway PostgreSQL)
   - `JWT_SECRET` (generate random string)
   - `JWT_REFRESH_SECRET` (generate random string)
   - `NODE_ENV=production`
   - `FRONTEND_URL` (URL frontend Anda)
5. Deploy!

### Frontend (Vercel/Netlify)

1. Connect repository di Vercel/Netlify
2. Set root directory: `frontend`
3. Framework preset: Vite
4. Set environment variable:
   - `VITE_API_URL` = URL backend Anda
5. Deploy!

## 📝 Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001
```

## 📦 Database Schema

- **User** - Data pengguna & authentication
- **Category** - Kategori produk
- **Product** - Data produk & inventory
- **Transaction** - Transaksi penjualan
- **TransactionItem** - Detail item transaksi
- **FinancialRecord** - Catatan keuangan (pemasukan/pengeluaran)
- **Debt** - Hutang piutang
- **DebtPayment** - Pembayaran hutang

## 🔐 Default Admin

```
Email: admin@tokoku.com
Password: admin123
```

**⚠️ Jangan lupa ganti password setelah login pertama!**

## 📄 License

MIT

## 🖥️ Appearance

### Landing page

<img width="3340" height="4154" alt="localhost_5173_ (1)" src="https://github.com/user-attachments/assets/6b39e105-8ee9-4a94-acd7-a295055be379" />

### Login Page

<img width="1919" height="971" alt="Screenshot 2026-01-02 124433" src="https://github.com/user-attachments/assets/75e1990c-4edb-4b26-ae97-cdf0261ac820" />

### Dashboard Page

<img width="3074" height="3034" alt="localhost_5173_dashboard (1)" src="https://github.com/user-attachments/assets/81d20441-f6a5-40a4-91fb-57c2ee500692" />

### SOP Page

<img width="3074" height="1926" alt="localhost_5173_dashboard_pos" src="https://github.com/user-attachments/assets/31838118-9ea0-48de-95c7-5063febd3794" />

### Inventory Page

<img width="3074" height="2442" alt="localhost_5173_dashboard (3)" src="https://github.com/user-attachments/assets/d74af7e2-1004-487a-99fe-f1ce2e24af02" />

### Category Page

<img width="3074" height="1726" alt="localhost_5173_dashboard (4)" src="https://github.com/user-attachments/assets/02d3b746-f7fb-468c-82df-641695d43dfb" />

### Finance Page

<img width="3074" height="2798" alt="localhost_5173_dashboard (5)" src="https://github.com/user-attachments/assets/2ca636f0-467e-4c7f-a483-7cad95b2671c" />

### Debt Page

<img width="3074" height="3176" alt="localhost_5173_dashboard (6)" src="https://github.com/user-attachments/assets/b1e50d19-26dd-42e8-856a-fa0ec2b74e3f" />

### User Management Page (Admin only)

<img width="3074" height="1700" alt="localhost_5173_dashboard_users" src="https://github.com/user-attachments/assets/90d5b0ee-f3cd-40be-9a60-5caf0b7db8f4" />

## 👨‍💻 Developer

Developed with ❤️ by Zein
