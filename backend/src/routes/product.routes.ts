import { Router } from "express";
import { productController } from "../controllers/product.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createProductSchema,
  updateProductSchema,
  getProductSchema,
  deleteProductSchema,
  listProductsSchema,
  updateStockSchema,
} from "../schemas/product.schema.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get product stats
router.get("/stats", productController.getStats.bind(productController));

// Get low stock products
router.get("/low-stock", productController.getLowStock.bind(productController));

// List products (paginated)
router.get(
  "/",
  validate(listProductsSchema),
  productController.findAll.bind(productController)
);

// Get product by ID
router.get(
  "/:id",
  validate(getProductSchema),
  productController.findById.bind(productController)
);

// Create product (Admin only)
router.post(
  "/",
  authorize("ADMIN"),
  validate(createProductSchema),
  productController.create.bind(productController)
);

// Update product (Admin only)
router.patch(
  "/:id",
  authorize("ADMIN"),
  validate(updateProductSchema),
  productController.update.bind(productController)
);

// Update stock (Admin only)
router.patch(
  "/:id/stock",
  authorize("ADMIN"),
  validate(updateStockSchema),
  productController.updateStock.bind(productController)
);

// Delete product (Admin only)
router.delete(
  "/:id",
  authorize("ADMIN"),
  validate(deleteProductSchema),
  productController.delete.bind(productController)
);

export default router;
