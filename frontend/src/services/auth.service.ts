import axiosInstance from "../lib/axios";
import {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  ApiResponse,
  User,
} from "../types/auth";

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
      "/api/auth/login",
      credentials
    );
    return response.data.data!;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
      "/api/auth/register",
      data
    );
    return response.data.data!;
  }

  async logout(): Promise<void> {
    await axiosInstance.post("/api/auth/logout");
  }

  async getProfile(): Promise<User> {
    const response = await axiosInstance.get<ApiResponse<User>>(
      "/api/auth/profile"
    );
    return response.data.data!;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await axiosInstance.patch<ApiResponse<User>>(
      "/api/auth/profile",
      data
    );
    return response.data.data!;
  }

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    await axiosInstance.post("/api/auth/change-password", {
      currentPassword,
      newPassword,
    });
  }

  // Local storage helpers
  saveAuth(data: AuthResponse): void {
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("user", JSON.stringify(data.user));
  }

  clearAuth(): void {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem("accessToken");
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export const authService = new AuthService();
