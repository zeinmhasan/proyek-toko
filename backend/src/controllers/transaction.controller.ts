import { Request, Response, NextFunction } from "express";
import { transactionService } from "../services/transaction.service.js";
import { sendSuccess, sendCreated } from "../utils/response.js";
import {
  CreateTransactionInput,
  UpdateTransactionStatusInput,
} from "../schemas/transaction.schema.js";

export class TransactionController {
  async create(
    req: Request<object, object, CreateTransactionInput["body"]>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const transaction = await transactionService.create(
        req.user!.userId,
        req.body
      );
      sendCreated(res, transaction, "Transaksi berhasil dibuat");
    } catch (error) {
      next(error);
    }
  }

  async findAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await transactionService.findAll(req.query as any);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async findById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const transaction = await transactionService.findById(req.params.id);
      sendSuccess(res, transaction);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(
    req: Request<
      UpdateTransactionStatusInput["params"],
      object,
      UpdateTransactionStatusInput["body"]
    >,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const transaction = await transactionService.updateStatus(
        req.params.id,
        req.body
      );
      sendSuccess(res, transaction, "Status transaksi berhasil diperbarui");
    } catch (error) {
      next(error);
    }
  }

  async getStats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await transactionService.getStats({
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
      });
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }

  async getDailySales(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 7;
      const sales = await transactionService.getDailySales(days);
      sendSuccess(res, sales);
    } catch (error) {
      next(error);
    }
  }
}

export const transactionController = new TransactionController();
