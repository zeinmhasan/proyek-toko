export type Role = "ADMIN" | "CASHIER" | "OWNER";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: Role;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  phone?: string;
  role?: Role;
}

export interface UpdateUserRoleInput {
  role: Role;
}

export interface ResetPasswordInput {
  newPassword: string;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  isActive?: boolean;
}
