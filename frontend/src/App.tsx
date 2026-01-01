import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import POSPage from "./pages/POSPage";
import InventoryPage from "./pages/InventoryPage";
import CategoryPage from "./pages/CategoryPage";
import FinancePage from "./pages/FinancePage";
import DebtPage from "./pages/DebtPage";
import UserManagementPage from "./pages/UserManagementPage";
import ProfilePage from "./pages/ProfilePage";
// import SettingsPage from "./pages/SettingsPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="pos" element={<POSPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="categories" element={<CategoryPage />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="debt" element={<DebtPage />} />
            <Route
              path="users"
              element={
                <AdminRoute>
                  <UserManagementPage />
                </AdminRoute>
              }
            />
            <Route path="profile" element={<ProfilePage />} />
            {/* Pengaturan toko dihapus */}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
