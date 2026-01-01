import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all dashboard data in one call
router.get("/", dashboardController.getDashboardData);

// Get summary statistics
router.get("/summary", dashboardController.getDashboardSummary);

// Get sales chart data
router.get("/sales-chart", dashboardController.getSalesChart);

// Get top selling products
router.get("/top-products", dashboardController.getTopProducts);

// Get recent activities
router.get("/activities", dashboardController.getRecentActivities);

// Get profit/loss report
router.get("/profit-loss", dashboardController.getProfitLoss);

// Get low stock products
router.get("/low-stock", dashboardController.getLowStockProducts);

export default router;
