import prisma from "../lib/prisma.js";
import { Prisma } from "@prisma/client";

// Helper to get date range
const getDateRange = (
  period?: string,
  startDate?: string,
  endDate?: string
): { start: Date; end: Date } => {
  const now = new Date();
  let start: Date;
  let end: Date = new Date(now.setHours(23, 59, 59, 999));

  switch (period) {
    case "today":
      start = new Date();
      start.setHours(0, 0, 0, 0);
      break;
    case "week":
      start = new Date();
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      break;
    case "month":
      start = new Date();
      start.setMonth(start.getMonth() - 1);
      start.setHours(0, 0, 0, 0);
      break;
    case "year":
      start = new Date();
      start.setFullYear(start.getFullYear() - 1);
      start.setHours(0, 0, 0, 0);
      break;
    case "custom":
      start = startDate ? new Date(startDate) : new Date();
      end = endDate ? new Date(endDate) : new Date();
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    default:
      // Default to this month
      start = new Date();
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
  }

  return { start, end };
};

class FinanceService {
  // Get finance summary (overview)
  async getSummary(period?: string, startDate?: string, endDate?: string) {
    const { start, end } = getDateRange(period, startDate, endDate);

    // Get completed transactions in date range
    const transactions = await prisma.transaction.findMany({
      where: {
        status: "COMPLETED",
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Calculate totals
    const totalRevenue = transactions.reduce(
      (sum, t) => sum + Number(t.total),
      0
    );
    const totalTransactions = transactions.length;
    const totalDiscount = transactions.reduce(
      (sum, t) => sum + Number(t.discount),
      0
    );
    const totalTax = transactions.reduce((sum, t) => sum + Number(t.tax), 0);

    // Calculate profit (revenue - cost)
    let totalCost = 0;
    let totalItemsSold = 0;
    transactions.forEach((t) => {
      t.items.forEach((item) => {
        totalItemsSold += item.quantity;
        const costPrice = Number(item.product.costPrice) || 0;
        totalCost += costPrice * item.quantity;
      });
    });
    const grossProfit = totalRevenue - totalCost;
    const profitMargin =
      totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    // Get previous period for comparison
    const periodDuration = end.getTime() - start.getTime();
    const prevStart = new Date(start.getTime() - periodDuration);
    const prevEnd = new Date(start.getTime() - 1);

    const prevTransactions = await prisma.transaction.findMany({
      where: {
        status: "COMPLETED",
        createdAt: {
          gte: prevStart,
          lte: prevEnd,
        },
      },
    });

    const prevRevenue = prevTransactions.reduce(
      (sum, t) => sum + Number(t.total),
      0
    );
    const prevTransactionCount = prevTransactions.length;

    // Calculate growth
    const revenueGrowth =
      prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    const transactionGrowth =
      prevTransactionCount > 0
        ? ((totalTransactions - prevTransactionCount) / prevTransactionCount) *
          100
        : 0;

    // Average transaction value
    const avgTransactionValue =
      totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    return {
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      revenue: {
        total: totalRevenue,
        growth: revenueGrowth,
      },
      transactions: {
        total: totalTransactions,
        growth: transactionGrowth,
        average: avgTransactionValue,
      },
      profit: {
        gross: grossProfit,
        margin: profitMargin,
        cost: totalCost,
      },
      itemsSold: totalItemsSold,
      discount: totalDiscount,
      tax: totalTax,
    };
  }

  // Get sales report (grouped by day/week/month)
  async getSalesReport(
    startDate?: string,
    endDate?: string,
    groupBy: "day" | "week" | "month" = "day"
  ) {
    const { start, end } = getDateRange("custom", startDate, endDate);

    // If no dates provided, default to last 30 days
    if (!startDate && !endDate) {
      start.setDate(start.getDate() - 30);
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        status: "COMPLETED",
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Group by date
    const grouped = new Map<
      string,
      { count: number; revenue: number; date: Date }
    >();

    transactions.forEach((t) => {
      let key: string;
      const date = new Date(t.createdAt);

      switch (groupBy) {
        case "week":
          // Get week start (Monday)
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay() + 1);
          key = weekStart.toISOString().split("T")[0];
          break;
        case "month":
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}`;
          break;
        default:
          key = date.toISOString().split("T")[0];
      }

      const existing = grouped.get(key) || { count: 0, revenue: 0, date };
      grouped.set(key, {
        count: existing.count + 1,
        revenue: existing.revenue + Number(t.total),
        date: existing.date,
      });
    });

    // Convert to array and sort
    const report = Array.from(grouped.entries())
      .map(([date, data]) => ({
        date,
        count: data.count,
        revenue: data.revenue,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate totals
    const totalRevenue = report.reduce((sum, r) => sum + r.revenue, 0);
    const totalTransactions = report.reduce((sum, r) => sum + r.count, 0);
    const avgDaily = report.length > 0 ? totalRevenue / report.length : 0;

    return {
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      groupBy,
      data: report,
      summary: {
        totalRevenue,
        totalTransactions,
        avgDaily,
        daysWithSales: report.filter((r) => r.count > 0).length,
      },
    };
  }

  // Get profit report
  async getProfitReport(startDate?: string, endDate?: string) {
    const { start, end } = getDateRange("custom", startDate, endDate);

    if (!startDate && !endDate) {
      start.setDate(start.getDate() - 30);
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        status: "COMPLETED",
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Group by day
    const dailyProfit = new Map<
      string,
      { revenue: number; cost: number; profit: number; count: number }
    >();

    transactions.forEach((t) => {
      const date = t.createdAt.toISOString().split("T")[0];
      const existing = dailyProfit.get(date) || {
        revenue: 0,
        cost: 0,
        profit: 0,
        count: 0,
      };

      let transactionCost = 0;
      t.items.forEach((item) => {
        const costPrice = Number(item.product.costPrice) || 0;
        transactionCost += costPrice * item.quantity;
      });

      const revenue = Number(t.total);
      dailyProfit.set(date, {
        revenue: existing.revenue + revenue,
        cost: existing.cost + transactionCost,
        profit: existing.profit + (revenue - transactionCost),
        count: existing.count + 1,
      });
    });

    const data = Array.from(dailyProfit.entries())
      .map(([date, values]) => ({
        date,
        ...values,
        margin: values.revenue > 0 ? (values.profit / values.revenue) * 100 : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
    const totalCost = data.reduce((sum, d) => sum + d.cost, 0);
    const totalProfit = data.reduce((sum, d) => sum + d.profit, 0);

    return {
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      data,
      summary: {
        totalRevenue,
        totalCost,
        totalProfit,
        avgMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
      },
    };
  }

  // Get top selling products
  async getTopProducts(
    startDate?: string,
    endDate?: string,
    limit: number = 10
  ) {
    const { start, end } = getDateRange("custom", startDate, endDate);

    if (!startDate && !endDate) {
      start.setDate(start.getDate() - 30);
    }

    const topProducts = await prisma.transactionItem.groupBy({
      by: ["productId"],
      where: {
        transaction: {
          status: "COMPLETED",
          createdAt: {
            gte: start,
            lte: end,
          },
        },
      },
      _sum: {
        quantity: true,
        subtotal: true,
      },
      orderBy: {
        _sum: {
          subtotal: "desc",
        },
      },
      take: limit,
    });

    // Get product details
    const productIds = topProducts.map((p) => p.productId);
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      include: {
        category: true,
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    const result = topProducts.map((tp, index) => {
      const product = productMap.get(tp.productId);
      return {
        rank: index + 1,
        productId: tp.productId,
        productName: product?.name || "Unknown",
        productSku: product?.sku || "",
        category: product?.category?.name || "Uncategorized",
        quantitySold: tp._sum.quantity || 0,
        revenue: Number(tp._sum.subtotal) || 0,
      };
    });

    return {
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      data: result,
    };
  }

  // Get payment method statistics
  async getPaymentMethodStats(startDate?: string, endDate?: string) {
    const { start, end } = getDateRange("custom", startDate, endDate);

    if (!startDate && !endDate) {
      start.setDate(start.getDate() - 30);
    }

    const stats = await prisma.transaction.groupBy({
      by: ["paymentMethod"],
      where: {
        status: "COMPLETED",
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      _count: true,
      _sum: {
        total: true,
      },
    });

    const totalTransactions = stats.reduce((sum, s) => sum + s._count, 0);
    const totalRevenue = stats.reduce(
      (sum, s) => sum + Number(s._sum.total || 0),
      0
    );

    const data = stats.map((s) => ({
      method: s.paymentMethod,
      count: s._count,
      revenue: Number(s._sum.total) || 0,
      percentage:
        totalTransactions > 0 ? (s._count / totalTransactions) * 100 : 0,
    }));

    return {
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      data,
      summary: {
        totalTransactions,
        totalRevenue,
      },
    };
  }

  // Get category sales
  async getCategorySales(startDate?: string, endDate?: string) {
    const { start, end } = getDateRange("custom", startDate, endDate);

    if (!startDate && !endDate) {
      start.setDate(start.getDate() - 30);
    }

    const items = await prisma.transactionItem.findMany({
      where: {
        transaction: {
          status: "COMPLETED",
          createdAt: {
            gte: start,
            lte: end,
          },
        },
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    // Group by category
    const categoryMap = new Map<
      string,
      { name: string; color: string; quantity: number; revenue: number }
    >();

    items.forEach((item) => {
      const categoryId = item.product.categoryId || "uncategorized";
      const categoryName = item.product.category?.name || "Lainnya";
      const categoryColor = item.product.category?.color || "#6b7280";

      const existing = categoryMap.get(categoryId) || {
        name: categoryName,
        color: categoryColor,
        quantity: 0,
        revenue: 0,
      };

      categoryMap.set(categoryId, {
        name: categoryName,
        color: categoryColor,
        quantity: existing.quantity + item.quantity,
        revenue: existing.revenue + Number(item.subtotal),
      });
    });

    const data = Array.from(categoryMap.entries())
      .map(([id, values]) => ({
        categoryId: id,
        ...values,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);

    return {
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      data: data.map((d) => ({
        ...d,
        percentage: totalRevenue > 0 ? (d.revenue / totalRevenue) * 100 : 0,
      })),
    };
  }
}

export const financeService = new FinanceService();
export default financeService;
