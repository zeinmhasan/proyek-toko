import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FolderOpen,
  TrendingUp,
  FileText,
  Users,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  User,
  Settings,
  Brain,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";

const SidebarItem = ({
  to,
  icon: Icon,
  label,
  onClick,
  end,
}: {
  to: string;
  icon: any;
  label: string;
  onClick?: () => void;
  end?: boolean;
}) => (
  <NavLink
    to={to}
    end={end}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
        isActive
          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 translate-x-1"
          : "text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:translate-x-1"
      }`
    }
  >
    {({ isActive }) => (
      <>
        <Icon
          size={20}
          className={`relative z-10 transition-transform duration-300 group-hover:scale-110 ${
            isActive ? "text-white" : ""
          }`}
        />
        <span className="font-medium relative z-10">{label}</span>
        {/* Hover Effect Background */}
        {!isActive && (
          <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
      </>
    )}
  </NavLink>
);

const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] =
    React.useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 transform transition-transform duration-300 ease-in-out lg:transform-none ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col p-6">
          {/* Logo */}
          <div className="flex items-center gap-3 px-2 mb-10">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-600/20 ring-4 ring-blue-50">
              <LayoutDashboard size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                TokoKu
              </h1>
              <p className="text-xs text-slate-400 font-medium tracking-wide">
                Management System
              </p>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="ml-auto lg:hidden text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            <SidebarItem
              to="/dashboard"
              end={true}
              icon={LayoutDashboard}
              label="Dashboard"
              onClick={() => setIsSidebarOpen(false)}
            />
            <SidebarItem
              to="/dashboard/pos"
              icon={ShoppingCart}
              label="Kasir (POS)"
              onClick={() => setIsSidebarOpen(false)}
            />
            <SidebarItem
              to="/dashboard/inventory"
              icon={Package}
              label="Stok Barang"
              onClick={() => setIsSidebarOpen(false)}
            />
            <SidebarItem
              to="/dashboard/categories"
              icon={FolderOpen}
              label="Kategori"
              onClick={() => setIsSidebarOpen(false)}
            />
            <SidebarItem
              to="/dashboard/finance"
              icon={TrendingUp}
              label="Keuangan"
              onClick={() => setIsSidebarOpen(false)}
            />
            <SidebarItem
              to="/dashboard/debt"
              icon={FileText}
              label="Buku Hutang"
              onClick={() => setIsSidebarOpen(false)}
            />
            <SidebarItem
              to="/dashboard/ai-insights"
              icon={Brain}
              label="AI Insights"
              onClick={() => setIsSidebarOpen(false)}
            />
            {/* Pengaturan toko dihapus */}

            {/* Admin Only Menu */}
            {user?.role === "ADMIN" && (
              <div className="pt-2 mt-2 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-2">
                  Admin
                </p>
                <SidebarItem
                  to="/dashboard/users"
                  icon={Users}
                  label="Kelola User"
                  onClick={() => setIsSidebarOpen(false)}
                />
              </div>
            )}
          </nav>

          {/* User Profile Card */}
          <div className="mt-auto pt-6 border-t border-slate-100">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md">
                  AD
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">
                    Admin Toko
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    Premium Plan
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all"
              >
                <LogOut size={14} />
                Keluar Aplikasi
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50/50 relative">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none" />

        {/* Desktop Header */}
        <header className="hidden lg:flex bg-white/70 backdrop-blur-xl border-b border-slate-200/60 p-4 px-8 items-center justify-between sticky top-0 z-30 transition-all duration-300">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                size={20}
              />
              <input
                type="text"
                placeholder="Cari menu, transaksi, atau barang..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100/50 border border-transparent rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-200 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2.5 text-slate-500 hover:bg-white hover:text-blue-600 hover:shadow-md hover:shadow-blue-100 rounded-xl transition-all duration-300">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white ring-2 ring-red-100"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-3 p-1.5 pr-3 hover:bg-white hover:shadow-md hover:shadow-blue-100 rounded-xl transition-all duration-300 group"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-md ring-2 ring-white group-hover:ring-blue-100 transition-all">
                  {user?.name.slice(0, 2).toUpperCase() || "U"}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700 transition-colors">
                    {user?.name || "User"}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">
                    {user?.role === "ADMIN"
                      ? "Administrator"
                      : user?.role === "OWNER"
                        ? "Owner"
                        : "Kasir"}
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-slate-400 group-hover:text-blue-500 transition-all ${
                    isProfileDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 py-2 z-50"
                  >
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="font-bold text-slate-800">{user?.name}</p>
                      <p className="text-sm text-slate-500">{user?.email}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          navigate("/dashboard/profile");
                        }}
                        className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-3 group"
                      >
                        <User
                          size={18}
                          className="text-slate-400 group-hover:text-blue-600 transition-colors"
                        />
                        <span className="font-medium">Profil Saya</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          navigate("/dashboard/profile");
                        }}
                        className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-3 group"
                      >
                        <Settings
                          size={18}
                          className="text-slate-400 group-hover:text-blue-600 transition-colors"
                        />
                        <span className="font-medium">Pengaturan</span>
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-slate-100 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 group"
                      >
                        <LogOut size={18} className="text-red-500" />
                        <span className="font-medium">Keluar</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <LayoutDashboard size={20} />
            </div>
            <span className="font-bold text-slate-800">TokoKu</span>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 lg:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
