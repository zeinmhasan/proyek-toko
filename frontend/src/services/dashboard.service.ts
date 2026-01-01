import axiosInstance from "../lib/axios";
import {
  DashboardData,
  DashboardSummary,
  SalesChartData,
  TopProduct,
  RecentActivity,
  ProfitLoss,
  LowStockProduct,
  DashboardPeriod,
  ChartPeriod,
} from "../types/dashboard";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class DashboardService {
  private baseUrl = "/api/dashboard";

  // Get all dashboard data in one call
  async getDashboardData(
    period: DashboardPeriod = "today"
  ): Promise<DashboardData> {
    const response = await axiosInstance.get<ApiResponse<DashboardData>>(
      this.baseUrl,
      { params: { period } }
    );
    return response.data.data;
  }

  // Get summary statistics
  async getSummary(
    period: DashboardPeriod = "today"
  ): Promise<DashboardSummary> {
    const response = await axiosInstance.get<ApiResponse<DashboardSummary>>(
      `${this.baseUrl}/summary`,
      { params: { period } }
    );
    return response.data.data;
  }

  // Get sales chart data
  async getSalesChart(period: ChartPeriod = "week"): Promise<SalesChartData[]> {
    const response = await axiosInstance.get<ApiResponse<SalesChartData[]>>(
      `${this.baseUrl}/sales-chart`,
      { params: { period } }
    );
    return response.data.data;
  }

  // Get top selling products
  async getTopProducts(
    limit: number = 5,
    period: ChartPeriod = "month"
  ): Promise<TopProduct[]> {
    const response = await axiosInstance.get<ApiResponse<TopProduct[]>>(
      `${this.baseUrl}/top-products`,
      { params: { limit, period } }
    );
    return response.data.data;
  }

  // Get recent activities
  async getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
    const response = await axiosInstance.get<ApiResponse<RecentActivity[]>>(
      `${this.baseUrl}/activities`,
      { params: { limit } }
    );
    return response.data.data;
  }

  // Get profit/loss report
  async getProfitLoss(period: ChartPeriod = "month"): Promise<ProfitLoss> {
    const response = await axiosInstance.get<ApiResponse<ProfitLoss>>(
      `${this.baseUrl}/profit-loss`,
      { params: { period } }
    );
    return response.data.data;
  }

  // Get low stock products
  async getLowStockProducts(
    threshold: number = 10,
    limit: number = 5
  ): Promise<LowStockProduct[]> {
    const response = await axiosInstance.get<ApiResponse<LowStockProduct[]>>(
      `${this.baseUrl}/low-stock`,
      { params: { threshold, limit } }
    );
    return response.data.data;
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
