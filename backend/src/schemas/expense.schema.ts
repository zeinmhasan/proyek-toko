import { z } from "zod";

export const createExpenseSchema = z.object({
  body: z.object({
    category: z.string().min(1, "Kategori harus diisi"),
    amount: z.number().positive("Jumlah harus lebih dari 0"),
    description: z.string().optional(),
    date: z.string().optional(),
    reference: z.string().optional(),
  }),
});

export const updateExpenseSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    category: z.string().min(1).optional(),
    amount: z.number().positive().optional(),
    description: z.string().optional(),
    date: z.string().optional(),
    reference: z.string().optional(),
  }),
});

export const getExpensesSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    category: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

export const expenseIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>["body"];
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>["body"];
export type GetExpensesQuery = z.infer<typeof getExpensesSchema>["query"];
