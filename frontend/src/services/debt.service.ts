import axiosInstance from "../lib/axios";
import {
  Debt,
  DebtPayment,
  DebtSummary,
  CreateDebtInput,
  UpdateDebtInput,
  AddPaymentInput,
  DebtFilters,
} from "../types/debt";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class DebtService {
  private baseUrl = "/api/debts";

  async getDebts(filters?: DebtFilters): Promise<{
    data: Debt[];
    meta: ApiResponse<Debt[]>["meta"];
  }> {
    const response = await axiosInstance.get<ApiResponse<Debt[]>>(
      this.baseUrl,
      { params: filters }
    );
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  }

  async getDebtById(id: string): Promise<Debt> {
    const response = await axiosInstance.get<ApiResponse<Debt>>(
      `${this.baseUrl}/${id}`
    );
    return response.data.data;
  }

  async createDebt(data: CreateDebtInput): Promise<Debt> {
    const response = await axiosInstance.post<ApiResponse<Debt>>(
      this.baseUrl,
      data
    );
    return response.data.data;
  }

  async updateDebt(id: string, data: UpdateDebtInput): Promise<Debt> {
    const response = await axiosInstance.put<ApiResponse<Debt>>(
      `${this.baseUrl}/${id}`,
      data
    );
    return response.data.data;
  }

  async deleteDebt(id: string): Promise<void> {
    await axiosInstance.delete(`${this.baseUrl}/${id}`);
  }

  async addPayment(
    debtId: string,
    data: AddPaymentInput
  ): Promise<DebtPayment> {
    const response = await axiosInstance.post<ApiResponse<DebtPayment>>(
      `${this.baseUrl}/${debtId}/payments`,
      data
    );
    return response.data.data;
  }

  async deletePayment(paymentId: string): Promise<void> {
    await axiosInstance.delete(`${this.baseUrl}/payments/${paymentId}`);
  }

  async getSummary(): Promise<DebtSummary> {
    const response = await axiosInstance.get<ApiResponse<DebtSummary>>(
      `${this.baseUrl}/summary`
    );
    return response.data.data;
  }
}

export const debtService = new DebtService();
export default debtService;
