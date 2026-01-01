import { Request, Response, NextFunction } from "express";
import { dashboardService } from "../services/dashboard.service.js";
import { sendSuccess } from "../utils/response.js";

// Get dashboard summary
export const getDashboardSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const period = (req.query.period as "today" | "week" | "month") || "today";
    const summary = await dashboardService.getSummary(period);
    sendSuccess(res, summary, "Berhasil mengambil ringkasan dashboard");
  } catch (error) {
    next(error);
  }
};

// Get sales chart data
export const getSalesChart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const period = (req.query.period as "week" | "month" | "year") || "week";
    const data = await dashboardService.getSalesChart(period);
    sendSuccess(res, data, "Berhasil mengambil data grafik penjualan");
  } catch (error) {
    next(error);
  }
};

// Get top selling products
export const getTopProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const period = (req.query.period as "week" | "month" | "year") || "month";
    const data = await dashboardService.getTopProducts(limit, period);
    sendSuccess(res, data, "Berhasil mengambil produk terlaris");
  } catch (error) {
    next(error);
  }
};

// Get recent activities
export const getRecentActivities = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const data = await dashboardService.getRecentActivities(limit);
    sendSuccess(res, data, "Berhasil mengambil aktivitas terbaru");
  } catch (error) {
    next(error);
  }
};

// Get profit/loss report
export const getProfitLoss = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const period = (req.query.period as "week" | "month" | "year") || "month";
    const data = await dashboardService.getProfitLoss(period);
    sendSuccess(res, data, "Berhasil mengambil laporan laba rugi");
  } catch (error) {
    next(error);
  }
};

// Get low stock products
export const getLowStockProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const threshold = parseInt(req.query.threshold as string) || 10;
    const limit = parseInt(req.query.limit as string) || 5;
    const data = await dashboardService.getLowStockProducts(threshold, limit);
    sendSuccess(res, data, "Berhasil mengambil produk stok rendah");
  } catch (error) {
    next(error);
  }
};

// Get all dashboard data
export const getDashboardData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const period = (req.query.period as "today" | "week" | "month") || "today";
    const data = await dashboardService.getDashboardData(period);
    sendSuccess(res, data, "Berhasil mengambil data dashboard");
  } catch (error) {
    next(error);
  }
};

export const dashboardController = {
  getDashboardSummary,
  getSalesChart,
  getTopProducts,
  getRecentActivities,
  getProfitLoss,
  getLowStockProducts,
  getDashboardData,
};
