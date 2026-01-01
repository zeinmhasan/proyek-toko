import { z } from "zod";

export const createDebtSchema = z.object({
  body: z.object({
    type: z.enum(["RECEIVABLE", "PAYABLE"], {
      required_error: "Tipe hutang harus diisi",
    }),
    personName: z.string().min(1, "Nama orang harus diisi"),
    personPhone: z.string().optional(),
    personAddress: z.string().optional(),
    amount: z.union([
      z.number().positive("Jumlah harus lebih dari 0"),
      z.string().transform((val) => {
        const num = parseFloat(val);
        if (isNaN(num) || num <= 0) {
          throw new Error("Jumlah harus lebih dari 0");
        }
        return num;
      }),
    ]),
    dueDate: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const updateDebtSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    personName: z.string().min(1).optional(),
    personPhone: z.string().optional(),
    personAddress: z.string().optional(),
    amount: z.number().positive().optional(),
    dueDate: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(["PENDING", "PARTIAL", "PAID", "OVERDUE"]).optional(),
  }),
});

export const getDebtsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    type: z.enum(["RECEIVABLE", "PAYABLE"]).optional(),
    status: z.enum(["PENDING", "PARTIAL", "PAID", "OVERDUE"]).optional(),
    search: z.string().optional(),
  }),
});

export const debtIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const addPaymentSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    amount: z.union([
      z.number().positive("Jumlah pembayaran harus lebih dari 0"),
      z.string().transform((val) => {
        const num = parseFloat(val);
        if (isNaN(num) || num <= 0) {
          throw new Error("Jumlah pembayaran harus lebih dari 0");
        }
        return num;
      }),
    ]),
    paymentMethod: z
      .enum(["CASH", "CARD", "TRANSFER", "QRIS", "OTHER"])
      .optional()
      .default("CASH"),
    notes: z.string().optional(),
  }),
});

export type CreateDebtInput = z.infer<typeof createDebtSchema>["body"];
export type UpdateDebtInput = z.infer<typeof updateDebtSchema>["body"];
export type GetDebtsQuery = z.infer<typeof getDebtsSchema>["query"];
export type AddPaymentInput = z.infer<typeof addPaymentSchema>["body"];
