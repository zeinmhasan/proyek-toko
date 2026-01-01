import { Request, Response, NextFunction } from "express";
import { AppError, ValidationError } from "../utils/errors.js";
import { sendError } from "../utils/response.js";
import { config } from "../config/index.js";
import { Prisma } from "@prisma/client";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  // Log error in development
  if (config.nodeEnv === "development") {
    console.error("Error:", err);
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        return sendError(res, "Data sudah ada (duplikat)", 409);
      case "P2025":
        return sendError(res, "Data tidak ditemukan", 404);
      case "P2003":
        return sendError(res, "Referensi data tidak valid", 400);
      default:
        return sendError(res, "Database error", 500);
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return sendError(res, "Data tidak valid", 400);
  }

  // Handle validation errors
  if (err instanceof ValidationError) {
    return sendError(res, err.message, err.statusCode, err.errors);
  }

  // Handle custom app errors
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode);
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return sendError(res, "Token tidak valid", 401);
  }

  if (err.name === "TokenExpiredError") {
    return sendError(res, "Token sudah expired", 401);
  }

  // Handle unknown errors
  const message =
    config.nodeEnv === "production"
      ? "Terjadi kesalahan pada server"
      : err.message;

  return sendError(res, message, 500);
};

export const notFoundHandler = (
  _req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  return sendError(res, "Endpoint tidak ditemukan", 404);
};
