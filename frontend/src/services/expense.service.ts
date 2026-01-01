import axiosInstance from "../lib/axios";
import {
  Expense,
  ExpenseCategory,
  ExpenseSummary,
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseFilters,
} from "../types/expense";

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

class ExpenseService {
  private baseUrl = "/api/expenses";

  async getExpenses(filters?: ExpenseFilters): Promise<{
    data: Expense[];
    meta: ApiResponse<Expense[]>["meta"];
  }> {
    const response = await axiosInstance.get<ApiResponse<Expense[]>>(
      this.baseUrl,
      { params: filters }
    );
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  }

  async getExpenseById(id: string): Promise<Expense> {
    const response = await axiosInstance.get<ApiResponse<Expense>>(
      `${this.baseUrl}/${id}`
    );
    return response.data.data;
  }

  async createExpense(data: CreateExpenseInput): Promise<Expense> {
    const response = await axiosInstance.post<ApiResponse<Expense>>(
      this.baseUrl,
      data
    );
    return response.data.data;
  }

  async updateExpense(id: string, data: UpdateExpenseInput): Promise<Expense> {
    const response = await axiosInstance.put<ApiResponse<Expense>>(
      `${this.baseUrl}/${id}`,
      data
    );
    return response.data.data;
  }

  async deleteExpense(id: string): Promise<void> {
    await axiosInstance.delete(`${this.baseUrl}/${id}`);
  }

  async getSummary(
    startDate?: string,
    endDate?: string
  ): Promise<ExpenseSummary> {
    const response = await axiosInstance.get<ApiResponse<ExpenseSummary>>(
      `${this.baseUrl}/summary`,
      { params: { startDate, endDate } }
    );
    return response.data.data;
  }

  async getCategories(): Promise<ExpenseCategory[]> {
    const response = await axiosInstance.get<ApiResponse<ExpenseCategory[]>>(
      `${this.baseUrl}/categories`
    );
    return response.data.data;
  }
}

export const expenseService = new ExpenseService();
export default expenseService;
