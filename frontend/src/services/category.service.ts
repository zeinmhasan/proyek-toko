import axiosInstance from "../lib/axios";
import {
  Category,
  CategorySimple,
  CreateCategoryData,
  UpdateCategoryData,
  ListParams,
  PaginatedResponse,
} from "../types/inventory";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class CategoryService {
  private baseUrl = "/api/categories";

  async getAll(params?: ListParams): Promise<PaginatedResponse<Category>> {
    const response = await axiosInstance.get<PaginatedResponse<Category>>(
      this.baseUrl,
      { params }
    );
    return response.data;
  }

  async getAllSimple(): Promise<CategorySimple[]> {
    const response = await axiosInstance.get<ApiResponse<CategorySimple[]>>(
      `${this.baseUrl}/all`
    );
    return response.data.data;
  }

  async getById(id: string): Promise<Category> {
    const response = await axiosInstance.get<ApiResponse<Category>>(
      `${this.baseUrl}/${id}`
    );
    return response.data.data;
  }

  async create(data: CreateCategoryData): Promise<Category> {
    const response = await axiosInstance.post<ApiResponse<Category>>(
      this.baseUrl,
      data
    );
    return response.data.data;
  }

  async update(id: string, data: UpdateCategoryData): Promise<Category> {
    const response = await axiosInstance.patch<ApiResponse<Category>>(
      `${this.baseUrl}/${id}`,
      data
    );
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`${this.baseUrl}/${id}`);
  }
}

export const categoryService = new CategoryService();
