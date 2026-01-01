import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, TokenPayload } from "../utils/auth.js";
import { UnauthorizedError, ForbiddenError } from "../utils/errors.js";
import prisma from "../lib/prisma.js";
import { Role } from "@prisma/client";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: Role;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Token tidak ditemukan");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new UnauthorizedError("Token tidak valid");
    }

    const decoded = verifyAccessToken(token) as TokenPayload;

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedError("User tidak ditemukan");
    }

    if (!user.isActive) {
      throw new UnauthorizedError("Akun tidak aktif");
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError("Token tidak valid atau sudah expired"));
    }
  }
};

export const authorize = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError("Tidak terautentikasi"));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ForbiddenError("Anda tidak memiliki akses ke resource ini")
      );
    }

    next();
  };
};

// Shortcut for admin-only routes
export const requireAdmin = authorize(Role.ADMIN);

// Optional auth - doesn't throw error if no token
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return next();
    }

    const decoded = verifyAccessToken(token) as TokenPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (user && user.isActive) {
      req.user = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };
    }

    next();
  } catch {
    // Silently continue without auth
    next();
  }
};
