import axiosInstance from "../lib/axios";
import {
  FinanceSummary,
  SalesReport,
  ProfitReport,
  TopProductsReport,
  PaymentMethodStats,
  CategorySalesReport,
  FinanceFilters,
} from "../types/finance";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class FinanceService {
  private baseUrl = "/api/finance";

  async getSummary(filters?: FinanceFilters): Promise<FinanceSummary> {
    const response = await axiosInstance.get<ApiResponse<FinanceSummary>>(
      `${this.baseUrl}/summary`,
      { params: filters }
    );
    return response.data.data;
  }

  async getSalesReport(filters?: FinanceFilters): Promise<SalesReport> {
    const response = await axiosInstance.get<ApiResponse<SalesReport>>(
      `${this.baseUrl}/sales`,
      { params: filters }
    );
    return response.data.data;
  }

  async getProfitReport(filters?: FinanceFilters): Promise<ProfitReport> {
    const response = await axiosInstance.get<ApiResponse<ProfitReport>>(
      `${this.baseUrl}/profit`,
      { params: filters }
    );
    return response.data.data;
  }

  async getTopProducts(filters?: FinanceFilters): Promise<TopProductsReport> {
    const response = await axiosInstance.get<ApiResponse<TopProductsReport>>(
      `${this.baseUrl}/top-products`,
      { params: filters }
    );
    return response.data.data;
  }

  async getPaymentMethodStats(
    filters?: FinanceFilters
  ): Promise<PaymentMethodStats> {
    const response = await axiosInstance.get<ApiResponse<PaymentMethodStats>>(
      `${this.baseUrl}/payment-methods`,
      { params: filters }
    );
    return response.data.data;
  }

  async getCategorySales(
    filters?: FinanceFilters
  ): Promise<CategorySalesReport> {
    const response = await axiosInstance.get<ApiResponse<CategorySalesReport>>(
      `${this.baseUrl}/categories`,
      { params: filters }
    );
    return response.data.data;
  }
}

export const financeService = new FinanceService();
export default financeService;
