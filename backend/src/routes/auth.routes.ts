import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { authenticate, requireAdmin, validate } from "../middlewares/index.js";
import {
  adminRegisterUserSchema,
  loginSchema,
  refreshTokenSchema,
  updateProfileSchema,
  changePasswordSchema,
  updateUserByAdminSchema,
  resetPasswordByAdminSchema,
} from "../schemas/auth.schema.js";

const router = Router();

// Public routes (no register - only admin can create users)
router.post(
  "/login",
  validate(loginSchema),
  authController.login.bind(authController)
);

router.post(
  "/refresh-token",
  validate(refreshTokenSchema),
  authController.refreshToken.bind(authController)
);

// Protected routes
router.post(
  "/logout",
  authenticate,
  authController.logout.bind(authController)
);

router.get(
  "/profile",
  authenticate,
  authController.getProfile.bind(authController)
);

router.patch(
  "/profile",
  authenticate,
  validate(updateProfileSchema),
  authController.updateProfile.bind(authController)
);

router.post(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword.bind(authController)
);

// Admin-only routes
router.post(
  "/users",
  authenticate,
  requireAdmin,
  validate(adminRegisterUserSchema),
  authController.registerUser.bind(authController)
);

router.get(
  "/users",
  authenticate,
  requireAdmin,
  authController.getAllUsers.bind(authController)
);

router.patch(
  "/users/:id/role",
  authenticate,
  requireAdmin,
  authController.updateUserRole.bind(authController)
);

router.patch(
  "/users/:id/toggle-status",
  authenticate,
  requireAdmin,
  authController.toggleUserStatus.bind(authController)
);

router.put(
  "/users/:id",
  authenticate,
  requireAdmin,
  validate(updateUserByAdminSchema),
  authController.updateUser.bind(authController)
);

router.post(
  "/users/:id/reset-password",
  authenticate,
  requireAdmin,
  validate(resetPasswordByAdminSchema),
  authController.resetPassword.bind(authController)
);

router.delete(
  "/users/:id",
  authenticate,
  requireAdmin,
  authController.deleteUser.bind(authController)
);

export default router;
