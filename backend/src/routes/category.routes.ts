import { Router } from "express";
import { categoryController } from "../controllers/category.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createCategorySchema,
  updateCategorySchema,
  getCategorySchema,
  deleteCategorySchema,
  listCategoriesSchema,
} from "../schemas/category.schema.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// List categories (paginated)
router.get(
  "/",
  validate(listCategoriesSchema),
  categoryController.findAll.bind(categoryController)
);

// Get all categories (simple list for dropdowns)
router.get("/all", categoryController.findAllSimple.bind(categoryController));

// Get category by ID
router.get(
  "/:id",
  validate(getCategorySchema),
  categoryController.findById.bind(categoryController)
);

// Create category (Admin only)
router.post(
  "/",
  authorize("ADMIN"),
  validate(createCategorySchema),
  categoryController.create.bind(categoryController)
);

// Update category (Admin only)
router.patch(
  "/:id",
  authorize("ADMIN"),
  validate(updateCategorySchema),
  categoryController.update.bind(categoryController)
);

// Delete category (Admin only)
router.delete(
  "/:id",
  authorize("ADMIN"),
  validate(deleteCategorySchema),
  categoryController.delete.bind(categoryController)
);

export default router;
