import axios from "../lib/axios";
import {
  Transaction,
  CreateTransactionInput,
  TransactionsResponse,
  TransactionFilters,
  TransactionStats,
  DailySales,
  TransactionStatus,
} from "../types/transaction";

export const transactionService = {
  // Create new transaction
  async create(data: CreateTransactionInput): Promise<Transaction> {
    const response = await axios.post("/api/transactions", data);
    return response.data.data;
  },

  // Get all transactions with filters
  async getAll(filters?: TransactionFilters): Promise<TransactionsResponse> {
    const params = new URLSearchParams();

    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.search) params.append("search", filters.search);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.paymentMethod)
      params.append("paymentMethod", filters.paymentMethod);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.sortBy) params.append("sortBy", filters.sortBy);
    if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

    const response = await axios.get(`/api/transactions?${params}`);
    return response.data.data;
  },

  // Get single transaction by ID
  async getById(id: string): Promise<Transaction> {
    const response = await axios.get(`/api/transactions/${id}`);
    return response.data.data;
  },

  // Update transaction status (cancel/refund)
  async updateStatus(
    id: string,
    status: TransactionStatus,
    notes?: string
  ): Promise<Transaction> {
    const response = await axios.patch(`/api/transactions/${id}/status`, {
      status,
      notes,
    });
    return response.data.data;
  },

  // Get transaction stats
  async getStats(filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<TransactionStats> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const response = await axios.get(`/api/transactions/stats?${params}`);
    return response.data.data;
  },

  // Get daily sales report
  async getDailySales(days?: number): Promise<DailySales[]> {
    const params = days ? `?days=${days}` : "";
    const response = await axios.get(`/api/transactions/daily-sales${params}`);
    return response.data.data;
  },
};
