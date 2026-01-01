import { Router } from "express";
import { authenticate } from "../middlewares/index.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  getFinanceSummarySchema,
  getSalesReportSchema,
  getProfitReportSchema,
  getTopProductsSchema,
  getPaymentMethodStatsSchema,
} from "../schemas/finance.schema.js";
import {
  getSummary,
  getSalesReport,
  getProfitReport,
  getTopProducts,
  getPaymentMethodStats,
  getCategorySales,
} from "../controllers/finance.controller.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/finance/summary - Get finance summary/overview
router.get("/summary", validate(getFinanceSummarySchema), getSummary);

// GET /api/finance/sales - Get sales report
router.get("/sales", validate(getSalesReportSchema), getSalesReport);

// GET /api/finance/profit - Get profit report
router.get("/profit", validate(getProfitReportSchema), getProfitReport);

// GET /api/finance/top-products - Get top selling products
router.get("/top-products", validate(getTopProductsSchema), getTopProducts);

// GET /api/finance/payment-methods - Get payment method statistics
router.get(
  "/payment-methods",
  validate(getPaymentMethodStatsSchema),
  getPaymentMethodStats
);

// GET /api/finance/categories - Get sales by category
router.get("/categories", getCategorySales);

export default router;
