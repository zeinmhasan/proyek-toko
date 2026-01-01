import dotenv from "dotenv";

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || "3001", 10),
  nodeEnv: process.env.NODE_ENV || "development",

  // Database
  databaseUrl: process.env.DATABASE_URL!,

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || "fallback-secret-key",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "fallback-refresh-secret",
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },

  // CORS
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  backendUrl: process.env.BACKEND_URL || "http://localhost:3001",

  // Pagination defaults
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
  },
} as const;

export type Config = typeof config;
