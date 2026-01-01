import { Router } from "express";
import { expenseController } from "../controllers/expense.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createExpenseSchema,
  updateExpenseSchema,
  getExpensesSchema,
  expenseIdSchema,
} from "../schemas/expense.schema.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get expense categories
router.get("/categories", expenseController.getExpenseCategories);

// Get expense summary
router.get("/summary", expenseController.getExpenseSummary);

// Get all expenses
router.get("/", validate(getExpensesSchema), expenseController.getExpenses);

// Get expense by ID
router.get("/:id", validate(expenseIdSchema), expenseController.getExpenseById);

// Create expense
router.post(
  "/",
  validate(createExpenseSchema),
  expenseController.createExpense
);

// Update expense
router.put(
  "/:id",
  validate(updateExpenseSchema),
  expenseController.updateExpense
);

// Delete expense
router.delete(
  "/:id",
  validate(expenseIdSchema),
  expenseController.deleteExpense
);

export default router;
