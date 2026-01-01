import { Router } from "express";
import { generateReceipt } from "../controllers/receipt.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// GET /api/receipt/:id
router.get("/:id", authenticate, generateReceipt);

export default router;
