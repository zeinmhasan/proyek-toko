import { z } from "zod";
import { Role } from "@prisma/client";

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Nama minimal 2 karakter")
      .max(100, "Nama maksimal 100 karakter"),
    email: z.string().email("Format email tidak valid"),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password harus mengandung huruf besar, huruf kecil, dan angka"
      ),
    phone: z.string().optional(),
  }),
});

export const adminRegisterUserSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Nama minimal 2 karakter")
      .max(100, "Nama maksimal 100 karakter"),
    email: z.string().email("Format email tidak valid"),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password harus mengandung huruf besar, huruf kecil, dan angka"
      ),
    phone: z.string().optional(),
    role: z.nativeEnum(Role, {
      errorMap: () => ({ message: "Role tidak valid" }),
    }),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(1, "Password harus diisi"),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token harus diisi"),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Nama minimal 2 karakter")
      .max(100, "Nama maksimal 100 karakter")
      .optional(),
    phone: z.string().optional(),
    avatar: z.string().url("Format URL avatar tidak valid").optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Password lama harus diisi"),
    newPassword: z
      .string()
      .min(8, "Password baru minimal 8 karakter")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password harus mengandung huruf besar, huruf kecil, dan angka"
      ),
  }),
});

// Admin: Update user data
export const updateUserByAdminSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Nama minimal 2 karakter")
      .max(100, "Nama maksimal 100 karakter")
      .optional(),
    email: z.string().email("Format email tidak valid").optional(),
    phone: z.string().optional(),
    role: z
      .nativeEnum(Role, {
        errorMap: () => ({ message: "Role tidak valid" }),
      })
      .optional(),
  }),
});

// Admin: Reset user password
export const resetPasswordByAdminSchema = z.object({
  body: z.object({
    newPassword: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password harus mengandung huruf besar, huruf kecil, dan angka"
      ),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type AdminRegisterUserInput = z.infer<typeof adminRegisterUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateUserByAdminInput = z.infer<typeof updateUserByAdminSchema>;
export type ResetPasswordByAdminInput = z.infer<
  typeof resetPasswordByAdminSchema
>;
