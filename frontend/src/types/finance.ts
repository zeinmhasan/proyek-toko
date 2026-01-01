export interface FinanceSummary {
  period: {
    start: string;
    end: string;
  };
  revenue: {
    total: number;
    growth: number;
  };
  transactions: {
    total: number;
    growth: number;
    average: number;
  };
  profit: {
    gross: number;
    margin: number;
    cost: number;
  };
  itemsSold: number;
  discount: number;
  tax: number;
}

export interface SalesReportData {
  date: string;
  count: number;
  revenue: number;
}

export interface SalesReport {
  period: {
    start: string;
    end: string;
  };
  groupBy: "day" | "week" | "month";
  data: SalesReportData[];
  summary: {
    totalRevenue: number;
    totalTransactions: number;
    avgDaily: number;
    daysWithSales: number;
  };
}

export interface ProfitReportData {
  date: string;
  revenue: number;
  cost: number;
  profit: number;
  count: number;
  margin: number;
}

export interface ProfitReport {
  period: {
    start: string;
    end: string;
  };
  data: ProfitReportData[];
  summary: {
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    avgMargin: number;
  };
}

export interface TopProduct {
  rank: number;
  productId: string;
  productName: string;
  productSku: string;
  category: string;
  quantitySold: number;
  revenue: number;
}

export interface TopProductsReport {
  period: {
    start: string;
    end: string;
  };
  data: TopProduct[];
}

export interface PaymentMethodStat {
  method: string;
  count: number;
  revenue: number;
  percentage: number;
}

export interface PaymentMethodStats {
  period: {
    start: string;
    end: string;
  };
  data: PaymentMethodStat[];
  summary: {
    totalTransactions: number;
    totalRevenue: number;
  };
}

export interface CategorySalesData {
  categoryId: string;
  name: string;
  color: string;
  quantity: number;
  revenue: number;
  percentage: number;
}

export interface CategorySalesReport {
  period: {
    start: string;
    end: string;
  };
  data: CategorySalesData[];
}

export interface FinanceFilters {
  period?: "today" | "week" | "month" | "year" | "custom";
  startDate?: string;
  endDate?: string;
  groupBy?: "day" | "week" | "month";
  limit?: number;
}
