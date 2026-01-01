import { z } from "zod";

// Get finance summary
export const getFinanceSummarySchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    period: z.enum(["today", "week", "month", "year", "custom"]).optional(),
  }),
});

// Get sales report
export const getSalesReportSchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    groupBy: z.enum(["day", "week", "month"]).optional().default("day"),
  }),
});

// Get profit report
export const getProfitReportSchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

// Get top products
export const getTopProductsSchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    limit: z.string().optional().default("10"),
  }),
});

// Get payment method stats
export const getPaymentMethodStatsSchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

export type GetFinanceSummaryInput = z.infer<typeof getFinanceSummarySchema>;
export type GetSalesReportInput = z.infer<typeof getSalesReportSchema>;
export type GetProfitReportInput = z.infer<typeof getProfitReportSchema>;
export type GetTopProductsInput = z.infer<typeof getTopProductsSchema>;
export type GetPaymentMethodStatsInput = z.infer<
  typeof getPaymentMethodStatsSchema
>;
