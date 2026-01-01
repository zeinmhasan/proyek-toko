import axios from "../lib/axios";
import {
  User,
  CreateUserInput,
  UpdateUserInput,
  UpdateUserRoleInput,
  ResetPasswordInput,
  UsersResponse,
  UserFilters,
} from "../types/user";

export const userService = {
  // Get all users (admin only)
  async getAllUsers(filters?: UserFilters): Promise<UsersResponse> {
    const params = new URLSearchParams();

    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.search) params.append("search", filters.search);
    if (filters?.role) params.append("role", filters.role);
    if (filters?.isActive !== undefined)
      params.append("isActive", filters.isActive.toString());

    const response = await axios.get(`/api/auth/users?${params}`);
    return response.data.data;
  },

  // Create new user (admin only)
  async createUser(data: CreateUserInput): Promise<User> {
    const response = await axios.post("/api/auth/users", data);
    return response.data.data;
  },

  // Update user (admin only)
  async updateUser(userId: string, data: UpdateUserInput): Promise<User> {
    const response = await axios.put(`/api/auth/users/${userId}`, data);
    return response.data.data;
  },

  // Update user role (admin only)
  async updateUserRole(
    userId: string,
    data: UpdateUserRoleInput
  ): Promise<User> {
    const response = await axios.patch(`/api/auth/users/${userId}/role`, data);
    return response.data.data;
  },

  // Toggle user active status (admin only)
  async toggleUserStatus(userId: string): Promise<User> {
    const response = await axios.patch(
      `/api/auth/users/${userId}/toggle-status`
    );
    return response.data.data;
  },

  // Reset user password (admin only)
  async resetPassword(userId: string, data: ResetPasswordInput): Promise<void> {
    await axios.post(`/api/auth/users/${userId}/reset-password`, data);
  },

  // Delete user (admin only)
  async deleteUser(userId: string): Promise<void> {
    await axios.delete(`/api/auth/users/${userId}`);
  },
};
