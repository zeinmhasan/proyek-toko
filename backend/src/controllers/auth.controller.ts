import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service.js";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/response.js";
import {
  RegisterInput,
  AdminRegisterUserInput,
  LoginInput,
  RefreshTokenInput,
  UpdateProfileInput,
  ChangePasswordInput,
  UpdateUserByAdminInput,
  ResetPasswordByAdminInput,
} from "../schemas/auth.schema.js";
import { Role } from "@prisma/client";

export class AuthController {
  async register(
    req: Request<object, object, RegisterInput["body"]>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await authService.register(req.body);
      sendCreated(res, result, "Registrasi berhasil");
    } catch (error) {
      next(error);
    }
  }

  async login(
    req: Request<object, object, LoginInput["body"]>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await authService.login(req.body);
      sendSuccess(res, result, "Login berhasil");
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(
    req: Request<object, object, RefreshTokenInput["body"]>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await authService.refreshToken(req.body.refreshToken);
      sendSuccess(res, result, "Token berhasil diperbarui");
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.logout(req.user!.userId);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }

  async getProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await authService.getProfile(req.user!.userId);
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(
    req: Request<object, object, UpdateProfileInput["body"]>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await authService.updateProfile(req.user!.userId, req.body);
      sendSuccess(res, user, "Profil berhasil diperbarui");
    } catch (error) {
      next(error);
    }
  }

  async changePassword(
    req: Request<object, object, ChangePasswordInput["body"]>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await authService.changePassword(req.user!.userId, req.body);
      sendSuccess(res, null, "Password berhasil diubah");
    } catch (error) {
      next(error);
    }
  }

  // Admin-only endpoints
  async registerUser(
    req: Request<object, object, AdminRegisterUserInput["body"]>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await authService.registerUserByAdmin(req.body);
      sendCreated(res, user, "User berhasil ditambahkan");
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(
    req: Request<
      object,
      object,
      object,
      {
        page?: string;
        limit?: string;
        search?: string;
        role?: Role;
        isActive?: string;
      }
    >,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await authService.getAllUsers({
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        search: req.query.search,
        role: req.query.role,
        isActive:
          req.query.isActive !== undefined
            ? req.query.isActive === "true"
            : undefined,
      });
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(
    req: Request<{ id: string }, object, { role: Role }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await authService.updateUserRole(
        req.params.id,
        req.body.role,
        req.user!.userId
      );
      sendSuccess(res, user, "Role user berhasil diperbarui");
    } catch (error) {
      next(error);
    }
  }

  async toggleUserStatus(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await authService.toggleUserStatus(
        req.params.id,
        req.user!.userId
      );
      sendSuccess(
        res,
        user,
        user.isActive
          ? "User berhasil diaktifkan"
          : "User berhasil dinonaktifkan"
      );
    } catch (error) {
      next(error);
    }
  }

  async updateUser(
    req: Request<{ id: string }, object, UpdateUserByAdminInput["body"]>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await authService.updateUserByAdmin(
        req.params.id,
        req.body,
        req.user!.userId
      );
      sendSuccess(res, user, "User berhasil diperbarui");
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(
    req: Request<{ id: string }, object, ResetPasswordByAdminInput["body"]>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await authService.resetPasswordByAdmin(
        req.params.id,
        req.body
      );
      sendSuccess(res, result, "Password user berhasil direset");
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await authService.deleteUser(req.params.id, req.user!.userId);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
