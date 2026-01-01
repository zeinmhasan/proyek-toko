import { z } from "zod";
import { PaymentMethod, TransactionStatus } from "@prisma/client";

// Schema untuk item transaksi
const transactionItemSchema = z.object({
  productId: z.string().min(1, "Product ID harus diisi"),
  quantity: z.number().int().min(1, "Quantity minimal 1"),
  price: z.number().min(0, "Harga tidak boleh negatif"),
});

// Create Transaction
export const createTransactionSchema = z.object({
  body: z.object({
    items: z.array(transactionItemSchema).min(1, "Minimal 1 item transaksi"),
    discount: z.number().min(0, "Diskon tidak boleh negatif").default(0),
    tax: z.number().min(0, "Pajak tidak boleh negatif").default(0),
    paidAmount: z.number().min(0, "Jumlah bayar tidak boleh negatif"),
    paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.CASH),
    notes: z.string().optional(),
    customerName: z.string().optional(),
    customerPhone: z.string().optional(),
  }),
});

// List Transactions
export const listTransactionsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().optional(),
    status: z.nativeEnum(TransactionStatus).optional(),
    paymentMethod: z.nativeEnum(PaymentMethod).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    sortBy: z
      .enum(["createdAt", "total", "invoiceNumber"])
      .default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

// Get Transaction by ID
export const getTransactionSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID transaksi harus diisi"),
  }),
});

// Update Transaction Status (Cancel/Refund)
export const updateTransactionStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID transaksi harus diisi"),
  }),
  body: z.object({
    status: z.nativeEnum(TransactionStatus),
    notes: z.string().optional(),
  }),
});

// Get Transaction Stats
export const getTransactionStatsSchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

// Types
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type ListTransactionsInput = z.infer<typeof listTransactionsSchema>;
export type GetTransactionInput = z.infer<typeof getTransactionSchema>;
export type UpdateTransactionStatusInput = z.infer<
  typeof updateTransactionStatusSchema
>;
export type GetTransactionStatsInput = z.infer<
  typeof getTransactionStatsSchema
>;
