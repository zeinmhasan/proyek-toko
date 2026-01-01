export interface DashboardSummary {
  totalSales: {
    value: number;
    trend: { value: number; isUp: boolean };
  };
  totalTransactions: {
    value: number;
    trend: { value: number; isUp: boolean };
  };
  itemsSold: {
    value: number;
    trend: { value: number; isUp: boolean };
  };
  averageTransaction: {
    value: number;
  };
}

export interface SalesChartData {
  label: string;
  sales: number;
  transactions: number;
}

export interface TopProduct {
  rank: number;
  productId: string;
  name: string;
  category: string;
  image: string | null;
  quantitySold: number;
  totalRevenue: number;
}

export interface RecentActivity {
  id: string;
  type: "sale" | "expense" | "debt" | "stock";
  title: string;
  description: string;
  amount: number | null;
  time: string;
}

export interface ProfitLoss {
  income: number;
  expense: number;
  netProfit: number;
  profitMargin: number;
  expenseBreakdown: {
    category: string;
    amount: number;
  }[];
}

export interface LowStockProduct {
  id: string;
  name: string;
  category: string;
  stock: number;
  image: string | null;
}

export interface DashboardData {
  summary: DashboardSummary;
  salesChart: SalesChartData[];
  topProducts: TopProduct[];
  recentActivities: RecentActivity[];
  profitLoss: ProfitLoss;
  lowStock: LowStockProduct[];
}

export type DashboardPeriod = "today" | "week" | "month";
export type ChartPeriod = "week" | "month" | "year";
