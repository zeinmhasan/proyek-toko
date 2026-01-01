import axiosInstance from "../lib/axios";
import {
  Product,
  CreateProductData,
  UpdateProductData,
  UpdateStockData,
  ProductStats,
  ProductListParams,
  PaginatedResponse,
} from "../types/inventory";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class ProductService {
  private baseUrl = "/api/products";

  async getAll(
    params?: ProductListParams
  ): Promise<PaginatedResponse<Product>> {
    const response = await axiosInstance.get<PaginatedResponse<Product>>(
      this.baseUrl,
      { params }
    );
    return response.data;
  }

  async getById(id: string): Promise<Product> {
    const response = await axiosInstance.get<ApiResponse<Product>>(
      `${this.baseUrl}/${id}`
    );
    return response.data.data;
  }

  async create(data: CreateProductData): Promise<Product> {
    const response = await axiosInstance.post<ApiResponse<Product>>(
      this.baseUrl,
      data
    );
    return response.data.data;
  }

  async update(id: string, data: UpdateProductData): Promise<Product> {
    const response = await axiosInstance.patch<ApiResponse<Product>>(
      `${this.baseUrl}/${id}`,
      data
    );
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`${this.baseUrl}/${id}`);
  }

  async updateStock(id: string, data: UpdateStockData): Promise<Product> {
    const response = await axiosInstance.patch<ApiResponse<Product>>(
      `${this.baseUrl}/${id}/stock`,
      data
    );
    return response.data.data;
  }

  async getLowStock(): Promise<Product[]> {
    const response = await axiosInstance.get<ApiResponse<Product[]>>(
      `${this.baseUrl}/low-stock`
    );
    return response.data.data;
  }

  async getStats(): Promise<ProductStats> {
    const response = await axiosInstance.get<ApiResponse<ProductStats>>(
      `${this.baseUrl}/stats`
    );
    return response.data.data;
  }
}

export const productService = new ProductService();
