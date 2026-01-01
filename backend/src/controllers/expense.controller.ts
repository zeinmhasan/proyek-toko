import { Request, Response, NextFunction } from "express";
import { expenseService } from "../services/expense.service.js";
import { sendSuccess, sendCreated } from "../utils/response.js";
import { NotFoundError } from "../utils/errors.js";

// Get all expenses
export const getExpenses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit, category, startDate, endDate } = req.query;
    const result = await expenseService.findAll({
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10,
      category: category as string,
      startDate: startDate as string,
      endDate: endDate as string,
    });
    sendSuccess(
      res,
      result.data,
      "Berhasil mengambil data pengeluaran",
      200,
      result.meta
    );
  } catch (error) {
    next(error);
  }
};

// Get expense by ID
export const getExpenseById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const expense = await expenseService.findById(id);
    if (!expense) {
      throw new NotFoundError("Pengeluaran tidak ditemukan");
    }
    sendSuccess(res, expense, "Berhasil mengambil detail pengeluaran");
  } catch (error) {
    next(error);
  }
};

// Create expense
export const createExpense = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const expense = await expenseService.create(userId, req.body);
    sendCreated(res, expense, "Pengeluaran berhasil dicatat");
  } catch (error) {
    next(error);
  }
};

// Update expense
export const updateExpense = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const existing = await expenseService.findById(id);
    if (!existing) {
      throw new NotFoundError("Pengeluaran tidak ditemukan");
    }
    const expense = await expenseService.update(id, req.body);
    sendSuccess(res, expense, "Pengeluaran berhasil diperbarui");
  } catch (error) {
    next(error);
  }
};

// Delete expense
export const deleteExpense = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const existing = await expenseService.findById(id);
    if (!existing) {
      throw new NotFoundError("Pengeluaran tidak ditemukan");
    }
    await expenseService.delete(id);
    sendSuccess(res, null, "Pengeluaran berhasil dihapus");
  } catch (error) {
    next(error);
  }
};

// Get expense summary
export const getExpenseSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate } = req.query;
    const summary = await expenseService.getSummary(
      startDate as string,
      endDate as string
    );
    sendSuccess(res, summary, "Berhasil mengambil ringkasan pengeluaran");
  } catch (error) {
    next(error);
  }
};

// Get expense categories
export const getExpenseCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = expenseService.getCategories();
    sendSuccess(res, categories, "Berhasil mengambil kategori pengeluaran");
  } catch (error) {
    next(error);
  }
};

export const expenseController = {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
  getExpenseCategories,
};

export default expenseController;
