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
- PostgreSQL 14+
- npm atau yarn

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env dengan konfigurasi database Anda

# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Seed database
npm run db:seed

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit VITE_API_URL jika perlu

# Start development server
npm run dev
```

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

## 👨‍💻 Developer

Developed with ❤️ by Zein
