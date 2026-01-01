import { Router } from "express";
import { debtController } from "../controllers/debt.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createDebtSchema,
  updateDebtSchema,
  getDebtsSchema,
  debtIdSchema,
  addPaymentSchema,
} from "../schemas/debt.schema.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get debt summary
router.get("/summary", debtController.getDebtSummary);

// Get all debts
router.get("/", validate(getDebtsSchema), debtController.getDebts);

// Get debt by ID
router.get("/:id", validate(debtIdSchema), debtController.getDebtById);

// Create debt
router.post("/", validate(createDebtSchema), debtController.createDebt);

// Update debt
router.put("/:id", validate(updateDebtSchema), debtController.updateDebt);

// Delete debt
router.delete("/:id", validate(debtIdSchema), debtController.deleteDebt);

// Add payment to debt
router.post(
  "/:id/payments",
  validate(addPaymentSchema),
  debtController.addPayment
);

// Delete payment
router.delete("/payments/:paymentId", debtController.deletePayment);

export default router;
