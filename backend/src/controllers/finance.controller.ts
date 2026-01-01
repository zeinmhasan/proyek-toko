import { Request, Response, NextFunction } from "express";
import { financeService } from "../services/finance.service.js";
import { sendSuccess } from "../utils/response.js";

export const getSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { period, startDate, endDate } = req.query;
    const summary = await financeService.getSummary(
      period as string,
      startDate as string,
      endDate as string
    );
    sendSuccess(res, summary, "Berhasil mengambil ringkasan keuangan");
  } catch (error) {
    next(error);
  }
};

export const getSalesReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, groupBy } = req.query;
    const report = await financeService.getSalesReport(
      startDate as string,
      endDate as string,
      groupBy as "day" | "week" | "month"
    );
    sendSuccess(res, report, "Berhasil mengambil laporan penjualan");
  } catch (error) {
    next(error);
  }
};

export const getProfitReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate } = req.query;
    const report = await financeService.getProfitReport(
      startDate as string,
      endDate as string
    );
    sendSuccess(res, report, "Berhasil mengambil laporan profit");
  } catch (error) {
    next(error);
  }
};

export const getTopProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, limit } = req.query;
    const report = await financeService.getTopProducts(
      startDate as string,
      endDate as string,
      limit ? parseInt(limit as string) : 10
    );
    sendSuccess(res, report, "Berhasil mengambil produk terlaris");
  } catch (error) {
    next(error);
  }
};

export const getPaymentMethodStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await financeService.getPaymentMethodStats(
      startDate as string,
      endDate as string
    );
    sendSuccess(res, stats, "Berhasil mengambil statistik pembayaran");
  } catch (error) {
    next(error);
  }
};

export const getCategorySales = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await financeService.getCategorySales(
      startDate as string,
      endDate as string
    );
    sendSuccess(res, stats, "Berhasil mengambil penjualan per kategori");
  } catch (error) {
    next(error);
  }
};

export const financeController = {
  getSummary,
  getSalesReport,
  getProfitReport,
  getTopProducts,
  getPaymentMethodStats,
  getCategorySales,
};

export class FinanceController {
  getSummary = getSummary;
  getSalesReport = getSalesReport;
  getProfitReport = getProfitReport;
  getTopProducts = getTopProducts;
  getPaymentMethodStats = getPaymentMethodStats;
  getCategorySales = getCategorySales;
}
