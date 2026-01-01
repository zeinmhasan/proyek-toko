import { Router } from "express";
import { transactionController } from "../controllers/transaction.controller.js";
import { authenticate, requireAdmin, validate } from "../middlewares/index.js";
import {
  createTransactionSchema,
  listTransactionsSchema,
  getTransactionSchema,
  updateTransactionStatusSchema,
  getTransactionStatsSchema,
} from "../schemas/transaction.schema.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create transaction (all authenticated users - cashiers)
router.post(
  "/",
  validate(createTransactionSchema),
  transactionController.create.bind(transactionController)
);

// Get all transactions
router.get(
  "/",
  validate(listTransactionsSchema),
  transactionController.findAll.bind(transactionController)
);

// Get transaction stats (admin only)
router.get(
  "/stats",
  requireAdmin,
  validate(getTransactionStatsSchema),
  transactionController.getStats.bind(transactionController)
);

// Get daily sales report
router.get(
  "/daily-sales",
  transactionController.getDailySales.bind(transactionController)
);

// Get single transaction
router.get(
  "/:id",
  validate(getTransactionSchema),
  transactionController.findById.bind(transactionController)
);

// Update transaction status (admin only - for cancel/refund)
router.patch(
  "/:id/status",
  requireAdmin,
  validate(updateTransactionStatusSchema),
  transactionController.updateStatus.bind(transactionController)
);

export default router;
