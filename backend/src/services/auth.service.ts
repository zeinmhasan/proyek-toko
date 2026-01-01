import prisma from "../lib/prisma.js";
import {
  hashPassword,
  comparePassword,
  generateTokens,
  verifyRefreshToken,
  TokenPayload,
} from "../utils/auth.js";
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from "../utils/errors.js";
import {
  RegisterInput,
  AdminRegisterUserInput,
  LoginInput,
  UpdateProfileInput,
  ChangePasswordInput,
  UpdateUserByAdminInput,
  ResetPasswordByAdminInput,
} from "../schemas/auth.schema.js";
import { Role } from "@prisma/client";

export class AuthService {
  async register(data: RegisterInput["body"]) {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError("Email sudah terdaftar");
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        role: Role.CASHIER, // Default role
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Save refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    return {
      user,
      ...tokens,
    };
  }

  async login(data: LoginInput["body"]) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedError("Email atau password salah");
    }

    if (!user.isActive) {
      throw new UnauthorizedError("Akun tidak aktif, silakan hubungi admin");
    }

    // Verify password
    const isPasswordValid = await comparePassword(data.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError("Email atau password salah");
    }

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Save refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
      },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken) as TokenPayload;

      // Find user and verify refresh token matches
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedError("Refresh token tidak valid");
      }

      if (!user.isActive) {
        throw new UnauthorizedError("Akun tidak aktif");
      }

      // Generate new tokens
      const tokens = generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Save new refresh token
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
      });

      return tokens;
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new UnauthorizedError(
        "Refresh token tidak valid atau sudah expired"
      );
    }
  }

  async logout(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User tidak ditemukan");
    }

    return user;
  }

  async updateProfile(userId: string, data: UpdateProfileInput["body"]) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        phone: data.phone,
        avatar: data.avatar,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async changePassword(userId: string, data: ChangePasswordInput["body"]) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User tidak ditemukan");
    }

    // Verify current password
    const isPasswordValid = await comparePassword(
      data.currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      throw new BadRequestError("Password lama tidak sesuai");
    }

    // Hash new password
    const hashedPassword = await hashPassword(data.newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  // Admin-only: Create new user
  async registerUserByAdmin(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role: Role;
  }) {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError("Email sudah terdaftar");
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        role: data.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
      },
    });

    return user;
  }

  // Admin-only: Get all users
  async getAllUsers(options: {
    page?: number;
    limit?: number;
    search?: string;
    role?: Role;
    isActive?: boolean;
  }) {
    const { page = 1, limit = 10, search, role, isActive } = options;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          avatar: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Admin-only: Update user role
  async updateUserRole(userId: string, role: Role, adminId: string) {
    // Self-protection: prevent admin from changing their own role
    if (userId === adminId) {
      throw new ForbiddenError("Tidak dapat mengubah role akun sendiri");
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return user;
  }

  // Admin-only: Toggle user active status
  async toggleUserStatus(userId: string, adminId: string) {
    // Self-protection: prevent admin from deactivating their own account
    if (userId === adminId) {
      throw new ForbiddenError("Tidak dapat menonaktifkan akun sendiri");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isActive: true },
    });

    if (!user) {
      throw new NotFoundError("User tidak ditemukan");
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  // Admin-only: Update user data
  async updateUserByAdmin(
    userId: string,
    data: UpdateUserByAdminInput["body"],
    adminId: string
  ) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundError("User tidak ditemukan");
    }

    // If email is being changed, check for conflicts
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (emailExists) {
        throw new ConflictError("Email sudah digunakan user lain");
      }
    }

    // Self-protection for role change
    if (data.role && userId === adminId) {
      throw new ForbiddenError("Tidak dapat mengubah role akun sendiri");
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return user;
  }

  // Admin-only: Reset user password
  async resetPasswordByAdmin(
    userId: string,
    data: ResetPasswordByAdminInput["body"]
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User tidak ditemukan");
    }

    // Hash new password
    const hashedPassword = await hashPassword(data.newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: "Password berhasil direset" };
  }

  // Admin-only: Delete user (hard delete)
  async deleteUser(userId: string, adminId: string) {
    // Self-protection: prevent admin from deleting their own account
    if (userId === adminId) {
      throw new ForbiddenError("Tidak dapat menghapus akun sendiri");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User tidak ditemukan");
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return { message: "User berhasil dihapus" };
  }
}

export const authService = new AuthService();
