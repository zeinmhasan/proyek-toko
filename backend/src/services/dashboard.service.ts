import prisma from "../lib/prisma.js";
import { Prisma } from "@prisma/client";

export class DashboardService {
  // Get date range helpers
  private getDateRange(period: "today" | "week" | "month" | "year") {
    const now = new Date();
    const start = new Date();
    const end = new Date();

    switch (period) {
      case "today":
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "week":
        start.setDate(now.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "month":
        start.setMonth(now.getMonth() - 1);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "year":
        start.setFullYear(now.getFullYear() - 1);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
    }

    return { start, end };
  }

  // Get previous period for comparison
  private getPreviousPeriodRange(period: "today" | "week" | "month" | "year") {
    const { start, end } = this.getDateRange(period);
    const diff = end.getTime() - start.getTime();

    return {
      start: new Date(start.getTime() - diff),
      end: new Date(start.getTime() - 1),
    };
  }

  // Calculate trend percentage
  private calculateTrend(
    current: number,
    previous: number
  ): { value: number; isUp: boolean } {
    if (previous === 0) {
      return { value: current > 0 ? 100 : 0, isUp: current >= 0 };
    }
    const change = ((current - previous) / previous) * 100;
    return { value: Math.abs(Math.round(change * 10) / 10), isUp: change >= 0 };
  }

  // Get summary statistics
  async getSummary(period: "today" | "week" | "month" | "year" = "today") {
    const { start, end } = this.getDateRange(period);
    const prevRange = this.getPreviousPeriodRange(period);

    // Current period stats
    const [currentSales, currentTransactions, currentItemsSold] =
      await Promise.all([
        // Total sales
        prisma.transaction.aggregate({
          where: {
            createdAt: { gte: start, lte: end },
            status: "COMPLETED",
          },
          _sum: { total: true },
          _count: true,
        }),
        // Transaction count
        prisma.transaction.count({
          where: {
            createdAt: { gte: start, lte: end },
            status: "COMPLETED",
          },
        }),
        // Items sold
        prisma.transactionItem.aggregate({
          where: {
            transaction: {
              createdAt: { gte: start, lte: end },
              status: "COMPLETED",
            },
          },
          _sum: { quantity: true },
        }),
      ]);

    // Previous period stats for comparison
    const [prevSales, prevTransactions, prevItemsSold] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          createdAt: { gte: prevRange.start, lte: prevRange.end },
          status: "COMPLETED",
        },
        _sum: { total: true },
      }),
      prisma.transaction.count({
        where: {
          createdAt: { gte: prevRange.start, lte: prevRange.end },
          status: "COMPLETED",
        },
      }),
      prisma.transactionItem.aggregate({
        where: {
          transaction: {
            createdAt: { gte: prevRange.start, lte: prevRange.end },
            status: "COMPLETED",
          },
        },
        _sum: { quantity: true },
      }),
    ]);

    const totalSales = Number(currentSales._sum.total || 0);
    const prevTotalSales = Number(prevSales._sum.total || 0);
    const totalItemsSold = currentItemsSold._sum.quantity || 0;
    const prevTotalItemsSold = prevItemsSold._sum.quantity || 0;

    return {
      totalSales: {
        value: totalSales,
        trend: this.calculateTrend(totalSales, prevTotalSales),
      },
      totalTransactions: {
        value: currentTransactions,
        trend: this.calculateTrend(currentTransactions, prevTransactions),
      },
      itemsSold: {
        value: totalItemsSold,
        trend: this.calculateTrend(totalItemsSold, prevTotalItemsSold),
      },
      averageTransaction: {
        value:
          currentTransactions > 0
            ? Math.round(totalSales / currentTransactions)
            : 0,
      },
    };
  }

  // Get sales chart data
  async getSalesChart(period: "week" | "month" | "year" = "week") {
    const now = new Date();
    const data: { label: string; sales: number; transactions: number }[] = [];

    console.log(`Getting sales chart for period: ${period}`);

    if (period === "week") {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        console.log(`Fetching data for ${dayStart} to ${dayEnd}`);

        const result = await prisma.transaction.aggregate({
          where: {
            createdAt: { gte: dayStart, lte: dayEnd },
            status: "COMPLETED",
          },
          _sum: { total: true },
          _count: true,
        });

        console.log(
          `Day ${i}: ${result._count} transactions, total: ${result._sum.total}`
        );

        data.push({
          label: date.toLocaleDateString("id-ID", { weekday: "short" }),
          sales: Number(result._sum.total || 0),
          transactions: result._count,
        });
      }
    } else if (period === "month") {
      // Last 30 days grouped by week
      for (let i = 3; i >= 0; i--) {
        const weekEnd = new Date(now);
        weekEnd.setDate(weekEnd.getDate() - i * 7);
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekStart.getDate() - 6);
        weekStart.setHours(0, 0, 0, 0);
        weekEnd.setHours(23, 59, 59, 999);

        const result = await prisma.transaction.aggregate({
          where: {
            createdAt: { gte: weekStart, lte: weekEnd },
            status: "COMPLETED",
          },
          _sum: { total: true },
          _count: true,
        });

        data.push({
          label: `Minggu ${4 - i}`,
          sales: Number(result._sum.total || 0),
          transactions: result._count,
        });
      }
    } else {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now);
        monthDate.setMonth(monthDate.getMonth() - i);
        const monthStart = new Date(
          monthDate.getFullYear(),
          monthDate.getMonth(),
          1
        );
        const monthEnd = new Date(
          monthDate.getFullYear(),
          monthDate.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );

        const result = await prisma.transaction.aggregate({
          where: {
            createdAt: { gte: monthStart, lte: monthEnd },
            status: "COMPLETED",
          },
          _sum: { total: true },
          _count: true,
        });

        data.push({
          label: monthDate.toLocaleDateString("id-ID", { month: "short" }),
          sales: Number(result._sum.total || 0),
          transactions: result._count,
        });
      }
    }

    return data;
  }

  // Get top selling products
  async getTopProducts(
    limit: number = 5,
    period: "week" | "month" | "year" = "month"
  ) {
    const { start, end } = this.getDateRange(period);

    const topProducts = await prisma.transactionItem.groupBy({
      by: ["productId"],
      where: {
        transaction: {
          createdAt: { gte: start, lte: end },
          status: "COMPLETED",
        },
      },
      _sum: {
        quantity: true,
        subtotal: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: limit,
    });

    // Get product details
    const productIds = topProducts.map((p) => p.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { category: true },
    });

    return topProducts.map((item, index) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        rank: index + 1,
        productId: item.productId,
        name: product?.name || "Unknown",
        category: product?.category?.name || "Uncategorized",
        image: product?.image || null,
        quantitySold: item._sum.quantity || 0,
        totalRevenue: Number(item._sum.subtotal || 0),
      };
    });
  }

  // Get recent activities
  async getRecentActivities(limit: number = 10) {
    const activities: {
      id: string;
      type: "sale" | "expense" | "debt" | "stock";
      title: string;
      description: string;
      amount: number | null;
      time: Date;
    }[] = [];

    // Get recent transactions
    const transactions = await prisma.transaction.findMany({
      where: { status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        invoiceNumber: true,
        total: true,
        createdAt: true,
      },
    });

    transactions.forEach((t) => {
      activities.push({
        id: `txn-${t.id}`,
        type: "sale",
        title: `Penjualan ${t.invoiceNumber}`,
        description: "Transaksi selesai",
        amount: Number(t.total),
        time: t.createdAt,
      });
    });

    // Get recent expenses
    const expenses = await prisma.financialRecord.findMany({
      where: { type: "EXPENSE" },
      orderBy: { date: "desc" },
      take: 5,
      select: {
        id: true,
        category: true,
        amount: true,
        description: true,
        date: true,
      },
    });

    expenses.forEach((e) => {
      activities.push({
        id: `exp-${e.id}`,
        type: "expense",
        title: e.category || "Pengeluaran",
        description: e.description || "",
        amount: -Number(e.amount),
        time: e.date,
      });
    });

    // Get recent debts
    const debts = await prisma.debtReceivable.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        type: true,
        personName: true,
        amount: true,
        createdAt: true,
      },
    });

    debts.forEach((d) => {
      activities.push({
        id: `debt-${d.id}`,
        type: "debt",
        title: `${d.type === "RECEIVABLE" ? "Piutang" : "Hutang"}: ${
          d.personName
        }`,
        description: d.type === "RECEIVABLE" ? "Piutang baru" : "Hutang baru",
        amount: Number(d.amount),
        time: d.createdAt,
      });
    });

    // Sort by time and return limited results
    return activities
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, limit);
  }

  // Get profit/loss summary
  async getProfitLoss(period: "week" | "month" | "year" = "month") {
    const { start, end } = this.getDateRange(period);

    // Get total sales (income)
    const salesResult = await prisma.transaction.aggregate({
      where: {
        createdAt: { gte: start, lte: end },
        status: "COMPLETED",
      },
      _sum: { total: true },
    });

    // Get total expenses
    const expenseResult = await prisma.financialRecord.aggregate({
      where: {
        date: { gte: start, lte: end },
        type: "EXPENSE",
      },
      _sum: { amount: true },
    });

    // Get expense breakdown by category
    const expenseByCategory = await prisma.financialRecord.groupBy({
      by: ["category"],
      where: {
        date: { gte: start, lte: end },
        type: "EXPENSE",
      },
      _sum: { amount: true },
    });

    const totalIncome = Number(salesResult._sum.total || 0);
    const totalExpense = Number(expenseResult._sum.amount || 0);
    const netProfit = totalIncome - totalExpense;

    return {
      income: totalIncome,
      expense: totalExpense,
      netProfit,
      profitMargin:
        totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0,
      expenseBreakdown: expenseByCategory.map((e) => ({
        category: e.category || "Lainnya",
        amount: Number(e._sum.amount || 0),
      })),
    };
  }

  // Get low stock products
  async getLowStockProducts(threshold: number = 10, limit: number = 5) {
    const products = await prisma.product.findMany({
      where: {
        stock: { lte: threshold },
        isActive: true,
      },
      orderBy: { stock: "asc" },
      take: limit,
      include: { category: true },
    });

    return products.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category?.name || "Uncategorized",
      stock: p.stock,
      image: p.image,
    }));
  }

  // Get overall dashboard data
  async getDashboardData(period: "today" | "week" | "month" = "today") {
    console.log(`Getting dashboard data for period: ${period}`);

    // Map dashboard period to chart period
    let chartPeriod: "week" | "month" | "year" = "week";
    if (period === "month") {
      chartPeriod = "month";
    } else {
      chartPeriod = "week";
    }

    console.log(`Mapped chart period: ${chartPeriod}`);

    const [
      summary,
      salesChart,
      topProducts,
      recentActivities,
      profitLoss,
      lowStock,
    ] = await Promise.all([
      this.getSummary(period),
      this.getSalesChart(chartPeriod),
      this.getTopProducts(5, period === "today" ? "month" : chartPeriod),
      this.getRecentActivities(10),
      this.getProfitLoss(period === "today" ? "month" : chartPeriod),
      this.getLowStockProducts(10, 5),
    ]);

    console.log(`Dashboard data fetched:`, {
      summaryTotalSales: summary.totalSales.value,
      salesChartLength: salesChart.length,
      topProductsLength: topProducts.length,
      recentActivitiesLength: recentActivities.length,
    });

    return {
      summary,
      salesChart,
      topProducts,
      recentActivities,
      profitLoss,
      lowStock,
    };
  }
}

export const dashboardService = new DashboardService();
