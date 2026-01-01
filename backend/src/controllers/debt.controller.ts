import { Request, Response, NextFunction } from "express";
import { debtService } from "../services/debt.service.js";
import { sendSuccess, sendCreated } from "../utils/response.js";
import { NotFoundError } from "../utils/errors.js";

// Get all debts
export const getDebts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Update overdue status first
    await debtService.updateOverdueStatus();

    const { page, limit, type, status, search } = req.query;
    const result = await debtService.findAll({
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10,
      type: type as "RECEIVABLE" | "PAYABLE" | undefined,
      status: status as "PENDING" | "PARTIAL" | "PAID" | "OVERDUE" | undefined,
      search: search as string,
    });
    sendSuccess(
      res,
      result.data,
      "Berhasil mengambil data hutang",
      200,
      result.meta
    );
  } catch (error) {
    next(error);
  }
};

// Get debt by ID
export const getDebtById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const debt = await debtService.findById(id);
    if (!debt) {
      throw new NotFoundError("Hutang tidak ditemukan");
    }
    sendSuccess(res, debt, "Berhasil mengambil detail hutang");
  } catch (error) {
    next(error);
  }
};

// Create debt
export const createDebt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const debt = await debtService.create(req.body);
    sendCreated(res, debt, "Hutang berhasil dicatat");
  } catch (error) {
    next(error);
  }
};

// Update debt
export const updateDebt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const existing = await debtService.findById(id);
    if (!existing) {
      throw new NotFoundError("Hutang tidak ditemukan");
    }
    const debt = await debtService.update(id, req.body);
    sendSuccess(res, debt, "Hutang berhasil diperbarui");
  } catch (error) {
    next(error);
  }
};

// Delete debt
export const deleteDebt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const existing = await debtService.findById(id);
    if (!existing) {
      throw new NotFoundError("Hutang tidak ditemukan");
    }
    await debtService.delete(id);
    sendSuccess(res, null, "Hutang berhasil dihapus");
  } catch (error) {
    next(error);
  }
};

// Add payment to debt
export const addPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const existing = await debtService.findById(id);
    if (!existing) {
      throw new NotFoundError("Hutang tidak ditemukan");
    }
    const payment = await debtService.addPayment(id, req.body);
    sendCreated(res, payment, "Pembayaran berhasil dicatat");
  } catch (error) {
    next(error);
  }
};

// Delete payment
export const deletePayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { paymentId } = req.params;
    await debtService.deletePayment(paymentId);
    sendSuccess(res, null, "Pembayaran berhasil dihapus");
  } catch (error) {
    next(error);
  }
};

// Get debt summary
export const getDebtSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await debtService.updateOverdueStatus();
    const summary = await debtService.getSummary();
    sendSuccess(res, summary, "Berhasil mengambil ringkasan hutang");
  } catch (error) {
    next(error);
  }
};

export const debtController = {
  getDebts,
  getDebtById,
  createDebt,
  updateDebt,
  deleteDebt,
  addPayment,
  deletePayment,
  getDebtSummary,
};

export default debtController;
