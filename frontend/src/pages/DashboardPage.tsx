import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Package,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingBag,
  Clock,
  ChevronRight,
  Plus,
  CreditCard,
  Loader2,
  TrendingDown,
  BarChart3,
  Receipt,
  AlertTriangle,
} from "lucide-react";
import { dashboardService } from "../services/dashboard.service";
import {
  DashboardData,
  DashboardPeriod,
  ChartPeriod,
} from "../types/dashboard";
import { useAuth } from "../contexts/AuthContext";

const StatCard = ({
  title,
  value,
  trend,
  trendUp,
  icon: Icon,
  color,
  loading,
}: {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: React.ElementType;
  color: string;
  loading?: boolean;
}) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group relative overflow-hidden">
    <div
      className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 opacity-10`}
    />

    <div className="flex justify-between items-start mb-6 relative z-10">
      <div
        className={`p-3.5 rounded-2xl ${color} bg-opacity-10 ring-4 ring-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
      >
        <Icon size={24} className={color.replace("bg-", "text-")} />
      </div>
      {!loading && trend && (
        <div
          className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-full border ${
            trendUp
              ? "bg-green-50 text-green-600 border-green-100"
              : "bg-red-50 text-red-600 border-red-100"
          }`}
        >
          {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      )}
    </div>
    <div className="relative z-10">
      <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
      {loading ? (
        <div className="h-9 bg-slate-100 rounded animate-pulse" />
      ) : (
        <p className="text-3xl font-bold text-slate-800 tracking-tight">
          {value}
        </p>
      )}
    </div>
  </div>
);

const QuickAction = ({
  icon: Icon,
  label,
  desc,
  color,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  desc: string;
  color: string;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className="flex items-center gap-5 p-5 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 text-left group relative overflow-hidden w-full"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
    <div
      className={`p-3.5 rounded-2xl ${color} text-white shadow-lg shadow-blue-600/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10`}
    >
      <Icon size={24} />
    </div>
    <div className="relative z-10">
      <h4 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">
        {label}
      </h4>
      <p className="text-sm text-slate-500 mt-0.5">{desc}</p>
    </div>
    <ChevronRight
      className="ml-auto text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all"
      size={20}
    />
  </button>
);

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(1)}jt`;
  }
  return `Rp ${new Intl.NumberFormat("id-ID").format(amount)}`;
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  return `${diffDays} hari lalu`;
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [period, setPeriod] = useState<DashboardPeriod>("today");
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("week");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const result = await dashboardService.getDashboardData(period);
      console.log("Dashboard data received:", result);
      console.log("Sales chart data:", result.salesChart);
      setData(result);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesChart = async (newPeriod: ChartPeriod) => {
    try {
      setChartPeriod(newPeriod);
      const chartData = await dashboardService.getSalesChart(newPeriod);
      if (data) {
        setData({ ...data, salesChart: chartData });
      }
    } catch (err) {
      console.error("Failed to fetch sales chart:", err);
    }
  };

  // Calculate max for chart scaling
  const maxSales = data?.salesChart
    ? Math.max(...data.salesChart.map((d) => d.sales), 1)
    : 1;

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/50 p-6 rounded-3xl border border-white/50 backdrop-blur-sm">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Selamat Datang, {user?.name?.split(" ")[0] || "Admin"}! 👋
          </h1>
          <p className="text-slate-500 text-lg">
            Berikut adalah ringkasan performa toko Anda{" "}
            {period === "today"
              ? "hari ini"
              : period === "week"
              ? "minggu ini"
              : "bulan ini"}
            .
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as DashboardPeriod)}
            className="text-sm border-none bg-white rounded-xl px-4 py-3 text-slate-600 focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-50 shadow-sm"
          >
            <option value="today">Hari Ini</option>
            <option value="week">7 Hari Terakhir</option>
            <option value="month">30 Hari Terakhir</option>
          </select>
          <div className="flex items-center gap-3 text-sm font-medium text-slate-600 bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Clock size={18} />
            </div>
            <span>
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Penjualan"
          value={formatCurrency(data?.summary.totalSales.value || 0)}
          trend={`${data?.summary.totalSales.trend.isUp ? "+" : "-"}${
            data?.summary.totalSales.trend.value || 0
          }%`}
          trendUp={data?.summary.totalSales.trend.isUp || false}
          icon={DollarSign}
          color="bg-blue-600"
          loading={loading}
        />
        <StatCard
          title="Total Transaksi"
          value={`${data?.summary.totalTransactions.value || 0} Order`}
          trend={`${data?.summary.totalTransactions.trend.isUp ? "+" : "-"}${
            data?.summary.totalTransactions.trend.value || 0
          }%`}
          trendUp={data?.summary.totalTransactions.trend.isUp || false}
          icon={ShoppingBag}
          color="bg-violet-600"
          loading={loading}
        />
        <StatCard
          title="Produk Terjual"
          value={`${data?.summary.itemsSold.value || 0} Item`}
          trend={`${data?.summary.itemsSold.trend.isUp ? "+" : "-"}${
            data?.summary.itemsSold.trend.value || 0
          }%`}
          trendUp={data?.summary.itemsSold.trend.isUp || false}
          icon={Package}
          color="bg-orange-500"
          loading={loading}
        />
        <StatCard
          title="Rata-rata Transaksi"
          value={formatCurrency(data?.summary.averageTransaction.value || 0)}
          trend=""
          trendUp={true}
          icon={BarChart3}
          color="bg-emerald-500"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Area (Left - 2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Sales Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800">Statistik Penjualan</h3>
              <select
                value={chartPeriod}
                onChange={(e) => fetchSalesChart(e.target.value as ChartPeriod)}
                className="text-sm border-none bg-slate-50 rounded-lg px-3 py-1 text-slate-600 focus:ring-0 cursor-pointer hover:bg-slate-100"
              >
                <option value="week">7 Hari Terakhir</option>
                <option value="month">Bulan Ini</option>
                <option value="year">Tahun Ini</option>
              </select>
            </div>

            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : data?.salesChart && data.salesChart.length > 0 ? (
              <div className="h-64 flex items-end justify-between gap-2 px-2">
                {data.salesChart.map((item, i) => {
                  const heightPercent =
                    maxSales > 0 ? (item.sales / maxSales) * 100 : 0;
                  return (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center gap-2 group h-full"
                    >
                      <div className="relative w-full bg-slate-50 rounded-t-xl overflow-hidden flex-1 flex items-end">
                        <div
                          className="w-full bg-gradient-to-t from-blue-600 to-blue-400 opacity-80 group-hover:opacity-100 transition-all rounded-t-xl relative"
                          style={{
                            height: `${Math.max(heightPercent, 5)}%`,
                            minHeight: "8px",
                          }}
                        >
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            {formatCurrency(item.sales)}
                            <br />
                            <span className="text-slate-400">
                              {item.transactions} transaksi
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <BarChart3 size={48} className="mx-auto mb-3 opacity-30" />
                  <p>Belum ada data penjualan untuk ditampilkan</p>
                  <p className="text-sm mt-1">
                    Mulai transaksi untuk melihat statistik
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Profit/Loss Summary */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">
              Ringkasan Laba Rugi
            </h3>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-slate-100 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp size={20} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Pendapatan</p>
                      <p className="font-bold text-green-600">
                        {formatCurrency(data?.profitLoss.income || 0)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <TrendingDown size={20} className="text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Pengeluaran</p>
                      <p className="font-bold text-red-600">
                        {formatCurrency(data?.profitLoss.expense || 0)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Receipt size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Laba Bersih</p>
                      <p
                        className={`font-bold ${
                          (data?.profitLoss.netProfit || 0) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(data?.profitLoss.netProfit || 0)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Margin</p>
                    <p className="font-bold text-slate-800">
                      {data?.profitLoss.profitMargin || 0}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="font-bold text-slate-800 mb-4">Akses Cepat</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <QuickAction
                icon={Plus}
                label="Transaksi Baru"
                desc="Catat penjualan kasir"
                color="bg-blue-600"
                onClick={() => navigate("/dashboard/pos")}
              />
              <QuickAction
                icon={Package}
                label="Tambah Produk"
                desc="Update stok barang"
                color="bg-orange-500"
                onClick={() => navigate("/dashboard/inventory")}
              />
              <QuickAction
                icon={CreditCard}
                label="Catat Pengeluaran"
                desc="Biaya operasional"
                color="bg-red-500"
                onClick={() => navigate("/dashboard/finance")}
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar (1 col) */}
        <div className="space-y-8">
          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800">Aktivitas Terbaru</h3>
              <button
                onClick={() => navigate("/dashboard/finance")}
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                Lihat Semua
              </button>
            </div>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-slate-100 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : data?.recentActivities && data.recentActivities.length > 0 ? (
              <div className="space-y-4">
                {data.recentActivities.slice(0, 6).map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        activity.type === "sale"
                          ? "bg-green-500"
                          : activity.type === "expense"
                          ? "bg-red-500"
                          : activity.type === "debt"
                          ? "bg-orange-500"
                          : "bg-blue-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-slate-800 truncate">
                        {activity.title}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {formatTimeAgo(activity.time)}
                      </p>
                    </div>
                    {activity.amount !== null && (
                      <span
                        className={`text-sm font-bold whitespace-nowrap ${
                          activity.amount >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {activity.amount >= 0 ? "+" : ""}
                        {formatCurrency(Math.abs(activity.amount))}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm text-center py-8">
                Belum ada aktivitas
              </p>
            )}
          </div>

          {/* Top Products */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-lg shadow-blue-600/20">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <TrendingUp size={20} />
              Produk Terlaris
            </h3>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-14 bg-white/10 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : data?.topProducts && data.topProducts.length > 0 ? (
              <div className="space-y-3">
                {data.topProducts.slice(0, 5).map((product) => (
                  <div
                    key={product.productId}
                    className="flex items-center justify-between bg-white/10 p-3 rounded-xl backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-blue-200 w-6">
                        #{product.rank}
                      </span>
                      <div>
                        <span className="font-medium text-sm block truncate max-w-[140px]">
                          {product.name}
                        </span>
                        <span className="text-xs text-blue-200">
                          {product.category}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-bold">
                      {product.quantitySold} terjual
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-blue-200 text-sm text-center py-8">
                Belum ada data penjualan
              </p>
            )}
            <button
              onClick={() => navigate("/dashboard/finance")}
              className="w-full mt-6 py-3 bg-white text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
            >
              Lihat Analisa Lengkap
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
