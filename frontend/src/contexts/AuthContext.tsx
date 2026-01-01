import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, LoginCredentials, RegisterData } from "../types/auth";
import { authService } from "../services/auth.service";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage on mount
    const initAuth = async () => {
      const storedUser = authService.getStoredUser();
      const token = authService.getAccessToken();

      if (storedUser && token) {
        try {
          // Verify token is still valid by fetching profile
          const currentUser = await authService.getProfile();
          setUser(currentUser);
          // Update stored user with fresh data
          localStorage.setItem("user", JSON.stringify(currentUser));
        } catch (error) {
          // Token invalid, clear auth
          authService.clearAuth();
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const data = await authService.login(credentials);
    authService.saveAuth(data);
    setUser(data.user);
  };

  const register = async (data: RegisterData) => {
    const authData = await authService.register(data);
    authService.saveAuth(authData);
    setUser(authData.user);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Even if API call fails, clear local auth
      console.error("Logout error:", error);
    } finally {
      authService.clearAuth();
      setUser(null);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
