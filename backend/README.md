# TokoKu Backend API

Backend API untuk sistem manajemen toko TokoKu, dibangun dengan Express, TypeScript, Prisma, dan PostgreSQL.

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (Access + Refresh Token)
- **Validation**: Zod
- **Container**: Docker

## 📁 Struktur Folder

```
backend/
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed data
├── src/
│   ├── config/           # Configuration
│   ├── controllers/      # Request handlers
│   ├── lib/              # Library (prisma client)
│   ├── middlewares/      # Express middlewares
│   ├── routes/           # API routes
│   ├── schemas/          # Zod validation schemas
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   └── server.ts         # Express app entry
├── docker-compose.yml    # Docker configuration
├── package.json
└── tsconfig.json
```

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm atau yarn

### 1. Clone dan Install Dependencies

```bash
cd backend
npm install
```

### 2. Jalankan Database (PostgreSQL)

```bash
docker-compose up -d
```

### 3. Setup Environment

File `.env` sudah ada, atau copy dari `.env.example`:

```bash
cp .env.example .env
```

### 4. Generate Prisma Client & Migrate Database

```bash
npm run db:generate
npm run db:push
```

### 5. (Optional) Seed Database

```bash
npm run db:seed
```

### 6. Jalankan Development Server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3001`

## 📚 API Endpoints

### Authentication

| Method | Endpoint                    | Description              |
| ------ | --------------------------- | ------------------------ |
| POST   | `/api/auth/register`        | Register user baru       |
| POST   | `/api/auth/login`           | Login user               |
| POST   | `/api/auth/refresh-token`   | Refresh access token     |
| POST   | `/api/auth/logout`          | Logout user              |
| GET    | `/api/auth/profile`         | Get current user profile |
| PATCH  | `/api/auth/profile`         | Update user profile      |
| POST   | `/api/auth/change-password` | Change password          |

### Health Check

| Method | Endpoint  | Description      |
| ------ | --------- | ---------------- |
| GET    | `/health` | Check API status |

## 🔐 Authentication

API menggunakan JWT dengan access token dan refresh token:

- **Access Token**: Expired dalam 15 menit
- **Refresh Token**: Expired dalam 7 hari

Untuk mengakses protected endpoint, sertakan header:

```
Authorization: Bearer <access_token>
```

## 📝 Scripts

```bash
npm run dev          # Development mode dengan hot reload
npm run build        # Build untuk production
npm run start        # Jalankan production build
npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema ke database
npm run db:migrate   # Buat dan jalankan migration
npm run db:studio    # Buka Prisma Studio
npm run db:seed      # Jalankan seed data
```

## 🐳 Docker Commands

```bash
# Jalankan PostgreSQL
docker-compose up -d

# Stop PostgreSQL
docker-compose down

# Lihat logs
docker-compose logs -f

# Reset database (hapus volume)
docker-compose down -v
```

## 👤 Default Admin Account

Setelah menjalankan seed:

- **Email**: admin@tokoku.com
- **Password**: Admin123!

