import React, { useState, useEffect } from "react";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  XCircle,
  Activity,
  BarChart3,
  Sparkles,
  AlertCircle,
  Info,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";
import {
  aiService,
  InsightsSummary,
  SalesInsights,
  InventoryInsights,
  AnomalyInsights,
  MLServiceHealth,
} from "../services/ai.service";

// Tab types
type TabType = "summary" | "sales" | "inventory" | "anomalies";

// Loading Skeleton
const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`bg-slate-200 animate-pulse rounded ${className}`} />
);

// Status Badge
const StatusBadge = ({
  status,
  label,
}: {
  status: "success" | "warning" | "error" | "info";
  label: string;
}) => {
  const colors = {
    success: "bg-green-100 text-green-700 border-green-200",
    warning: "bg-amber-100 text-amber-700 border-amber-200",
    error: "bg-red-100 text-red-700 border-red-200",
    info: "bg-blue-100 text-blue-700 border-blue-200",
  };

  const icons = {
    success: CheckCircle,
    warning: AlertTriangle,
    error: XCircle,
    info: Info,
  };

  const Icon = icons[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${colors[status]}`}
    >
      <Icon size={12} />
      {label}
    </span>
  );
};

// AI Advice Card
const AIAdviceCard = ({
  advice,
  source,
  loading,
}: {
  advice: string;
  source: string;
  loading: boolean;
}) => {
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="w-32 h-5" />
        </div>
        <Skeleton className="w-full h-4 mb-2" />
        <Skeleton className="w-3/4 h-4 mb-2" />
        <Skeleton className="w-5/6 h-4" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl text-white">
          <Sparkles size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800">AI Advisor</h3>
          <p className="text-xs text-slate-500">
            Powered by {source === "gemini" ? "Gemini AI" : "Rule-based System"}
          </p>
        </div>
      </div>
      <div className="prose prose-sm prose-slate max-w-none">
        <div
          className="text-slate-700 whitespace-pre-wrap"
          dangerouslySetInnerHTML={{
            __html: advice
              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
              .replace(/\n/g, "<br />"),
          }}
        />
      </div>
    </div>
  );
};

// Stats Card
const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendUp,
  color,
  loading,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  color: string;
  loading: boolean;
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-slate-100">
        <div className="flex justify-between items-start mb-4">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="w-16 h-6 rounded-full" />
        </div>
        <Skeleton className="w-24 h-4 mb-2" />
        <Skeleton className="w-32 h-8" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
              trendUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
            }`}
          >
            {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend}
          </div>
        )}
      </div>
      <p className="text-sm text-slate-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
};

// Inventory Alert Item
const InventoryAlertItem = ({
  name,
  stock,
  status,
  recommendation,
}: {
  name: string;
  stock: number;
  status: string;
  recommendation: string;
}) => {
  const statusColors = {
    critical: "border-l-red-500 bg-red-50",
    warning: "border-l-amber-500 bg-amber-50",
    healthy: "border-l-green-500 bg-green-50",
    overstocked: "border-l-blue-500 bg-blue-50",
  };

  return (
    <div
      className={`border-l-4 rounded-r-xl p-4 ${
        statusColors[status as keyof typeof statusColors] ||
        statusColors.healthy
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-slate-800">{name}</h4>
          <p className="text-sm text-slate-600">Stok: {stock} unit</p>
        </div>
        <StatusBadge
          status={
            status === "critical"
              ? "error"
              : status === "warning"
                ? "warning"
                : status === "overstocked"
                  ? "info"
                  : "success"
          }
          label={
            status === "critical"
              ? "Kritis"
              : status === "warning"
                ? "Perhatian"
                : status === "overstocked"
                  ? "Overstock"
                  : "Sehat"
          }
        />
      </div>
      <p className="text-xs text-slate-500 mt-2">{recommendation}</p>
    </div>
  );
};

// Anomaly Item
const AnomalyItem = ({
  type,
  description,
  severity,
  timestamp,
}: {
  type: string;
  description: string;
  severity: string;
  timestamp?: string;
}) => {
  const typeLabels: Record<string, string> = {
    high_value_transaction: "Transaksi Nilai Tinggi",
    unusual_hour: "Jam Tidak Biasa",
    high_discount: "Diskon Tinggi",
    high_quantity: "Kuantitas Tinggi",
    low_transaction_day: "Hari Transaksi Rendah",
    high_revenue_day: "Hari Revenue Tinggi",
  };

  return (
    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
      <div
        className={`p-2 rounded-lg ${
          severity === "high"
            ? "bg-red-100 text-red-600"
            : severity === "medium"
              ? "bg-amber-100 text-amber-600"
              : "bg-blue-100 text-blue-600"
        }`}
      >
        <AlertCircle size={16} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-slate-800">
            {typeLabels[type] || type}
          </span>
          <StatusBadge
            status={
              severity === "high"
                ? "error"
                : severity === "medium"
                  ? "warning"
                  : "info"
            }
            label={
              severity === "high"
                ? "Tinggi"
                : severity === "medium"
                  ? "Sedang"
                  : "Rendah"
            }
          />
        </div>
        <p className="text-sm text-slate-600">{description}</p>
        {timestamp && (
          <p className="text-xs text-slate-400 mt-1">
            {new Date(timestamp).toLocaleString("id-ID")}
          </p>
        )}
      </div>
    </div>
  );
};

const AIInsightsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("summary");
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mlHealth, setMlHealth] = useState<MLServiceHealth | null>(null);

  // Data states - persist across tab changes
  const [summary, setSummary] = useState<InsightsSummary | null>(null);
  const [salesInsights, setSalesInsights] = useState<SalesInsights | null>(
    null,
  );
  const [inventoryInsights, setInventoryInsights] =
    useState<InventoryInsights | null>(null);
  const [anomalyInsights, setAnomalyInsights] =
    useState<AnomalyInsights | null>(null);

  // Track which tabs have been loaded
  const [loadedTabs, setLoadedTabs] = useState<Set<TabType>>(new Set());

  // Check ML service health
  const checkHealth = async () => {
    try {
      const health = await aiService.checkHealth();
      setMlHealth(health);
      return health.status === "connected";
    } catch {
      setMlHealth({ status: "disconnected", error: "Cannot connect" });
      return false;
    }
  };

  // Load data based on active tab - only called manually or on initial load
  const loadData = async (forceRefresh = false) => {
    // If already loaded this tab and not forcing refresh, skip
    if (loadedTabs.has(activeTab) && !forceRefresh) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const isConnected = await checkHealth();
      if (!isConnected) {
        setError("ML Service tidak tersedia. Pastikan service berjalan.");
        setLoading(false);
        return;
      }

      switch (activeTab) {
        case "summary":
          const summaryData = await aiService.getInsightsSummary();
          setSummary(summaryData);
          break;
        case "sales":
          const salesData = await aiService.getSalesInsights(7);
          setSalesInsights(salesData);
          break;
        case "inventory":
          const inventoryData = await aiService.getInventoryInsights();
          setInventoryInsights(inventoryData);
          break;
        case "anomalies":
          const anomalyData = await aiService.getAnomalyInsights(7);
          setAnomalyInsights(anomalyData);
          break;
      }

      // Mark this tab as loaded
      setLoadedTabs((prev) => new Set(prev).add(activeTab));
    } catch (err: unknown) {
      const errorObj = err as {
        response?: { status?: number; data?: { message?: string } };
        message?: string;
      };

      // Ignore 401 errors as they're handled by axios interceptor
      if (errorObj.response?.status === 401) {
        return;
      }

      setError(
        errorObj.response?.data?.message ||
          errorObj.message ||
          "Gagal memuat data",
      );
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  // Manual refresh handler
  const handleRefresh = () => {
    loadData(true);
  };

  // Only load on initial mount for summary tab
  useEffect(() => {
    if (initialLoad) {
      loadData(false);
    }
  }, []);

  // Check if current tab has data
  const hasCurrentTabData = () => {
    switch (activeTab) {
      case "summary":
        return summary !== null;
      case "sales":
        return salesInsights !== null;
      case "inventory":
        return inventoryInsights !== null;
      case "anomalies":
        return anomalyInsights !== null;
      default:
        return false;
    }
  };

  const tabs = [
    { id: "summary" as TabType, label: "Ringkasan", icon: Brain },
    { id: "sales" as TabType, label: "Prediksi Penjualan", icon: TrendingUp },
    { id: "inventory" as TabType, label: "Inventori", icon: Package },
    { id: "anomalies" as TabType, label: "Anomali", icon: AlertTriangle },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl text-white">
              <Brain size={24} />
            </div>
            AI Insights
          </h1>
          <p className="text-slate-500 mt-1">
            Analisis dan prediksi bisnis menggunakan Machine Learning
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* ML Service Status */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-slate-200">
            <div
              className={`w-2 h-2 rounded-full ${
                mlHealth?.status === "connected" ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-sm text-slate-600">
              {mlHealth?.status === "connected" ? "ML Active" : "ML Offline"}
            </span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <XCircle className="text-red-500" size={20} />
          <div>
            <p className="font-medium text-red-800">Error</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-100 p-1.5 inline-flex gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const hasData = loadedTabs.has(tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon size={16} />
              {tab.label}
              {hasData && activeTab !== tab.id && (
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Load Data Button for tabs without data */}
      {!hasCurrentTabData() && !loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <Brain className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            Data Belum Dimuat
          </h3>
          <p className="text-slate-500 mb-4">
            Klik tombol di bawah untuk memuat analisis AI untuk tab ini
          </p>
          <button
            onClick={() => loadData(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-indigo-600 transition-all"
          >
            <Sparkles size={18} />
            Muat Analisis AI
          </button>
        </div>
      )}

      {/* Content */}
      {(hasCurrentTabData() || loading) && (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Summary Tab */}
          {activeTab === "summary" && (
            <div className="space-y-6">
              {/* Data Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                  title="Total Transaksi"
                  value={
                    summary?.data_stats?.transactions?.total?.toString() || "0"
                  }
                  subtitle={`${summary?.data_stats?.transactions?.days_of_data || 0} hari data`}
                  icon={BarChart3}
                  color="bg-blue-500"
                  loading={loading}
                />
                <StatsCard
                  title="Prediksi 7 Hari"
                  value={formatCurrency(
                    summary?.sales_forecast?.summary?.total_predicted_revenue ||
                      0,
                  )}
                  trend={`${summary?.sales_forecast?.summary?.trend_percentage || 0}%`}
                  trendUp={
                    (summary?.sales_forecast?.summary?.trend_percentage || 0) >
                    0
                  }
                  icon={TrendingUp}
                  color="bg-green-500"
                  loading={loading}
                />
                <StatsCard
                  title="Produk Perlu Restock"
                  value={(
                    (summary?.inventory_alerts?.summary?.critical_count || 0) +
                    (summary?.inventory_alerts?.summary?.warning_count || 0)
                  ).toString()}
                  subtitle={`${summary?.inventory_alerts?.summary?.critical_count || 0} kritis`}
                  icon={Package}
                  color="bg-amber-500"
                  loading={loading}
                />
                <StatsCard
                  title="Anomali Terdeteksi"
                  value={
                    summary?.anomalies?.summary?.total_anomalies?.toString() ||
                    "0"
                  }
                  subtitle={`${summary?.anomalies?.summary?.high_severity || 0} severity tinggi`}
                  icon={AlertTriangle}
                  color="bg-red-500"
                  loading={loading}
                />
              </div>

              {/* ML Readiness */}
              {summary?.data_stats?.ml_readiness && (
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Activity size={18} />
                    Status ML Model
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <span className="text-sm text-slate-600">
                        Forecasting
                      </span>
                      <StatusBadge
                        status={
                          summary.data_stats.ml_readiness.forecasting.ready
                            ? "success"
                            : "warning"
                        }
                        label={
                          summary.data_stats.ml_readiness.forecasting.ready
                            ? "Aktif"
                            : "Fallback"
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <span className="text-sm text-slate-600">Inventory</span>
                      <StatusBadge
                        status={
                          summary.data_stats.ml_readiness.inventory_optimization
                            .ready
                            ? "success"
                            : "warning"
                        }
                        label={
                          summary.data_stats.ml_readiness.inventory_optimization
                            .ready
                            ? "Aktif"
                            : "Fallback"
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <span className="text-sm text-slate-600">
                        Anomaly Detection
                      </span>
                      <StatusBadge
                        status={
                          summary.data_stats.ml_readiness.anomaly_detection
                            .ready
                            ? "success"
                            : "warning"
                        }
                        label={
                          summary.data_stats.ml_readiness.anomaly_detection
                            .ready
                            ? "Aktif"
                            : "Fallback"
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* AI Advice */}
              <AIAdviceCard
                advice={summary?.ai_advice?.advice || ""}
                source={summary?.ai_advice?.source || "fallback"}
                loading={loading}
              />
            </div>
          )}

          {/* Sales Tab */}
          {activeTab === "sales" && (
            <div className="space-y-6">
              {/* Forecast Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard
                  title="Total Prediksi 7 Hari"
                  value={formatCurrency(
                    salesInsights?.forecast?.summary?.total_predicted_revenue ||
                      0,
                  )}
                  icon={TrendingUp}
                  color="bg-green-500"
                  loading={loading}
                />
                <StatsCard
                  title="Rata-rata Harian"
                  value={formatCurrency(
                    salesInsights?.forecast?.summary?.average_daily_revenue ||
                      0,
                  )}
                  icon={BarChart3}
                  color="bg-blue-500"
                  loading={loading}
                />
                <StatsCard
                  title="Trend"
                  value={
                    salesInsights?.forecast?.summary?.trend?.toUpperCase() ||
                    "-"
                  }
                  trend={`${salesInsights?.forecast?.summary?.trend_percentage || 0}%`}
                  trendUp={
                    (salesInsights?.forecast?.summary?.trend_percentage || 0) >
                    0
                  }
                  icon={Activity}
                  color="bg-purple-500"
                  loading={loading}
                />
              </div>

              {/* Sales Prediction Chart */}
              {salesInsights?.forecast?.predictions && (
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                  <div className="p-5 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-800">
                      Grafik Prediksi Penjualan
                    </h3>
                    <p className="text-sm text-slate-500">
                      Perbandingan data historis dengan prediksi 7 hari ke depan
                    </p>
                  </div>
                  <div className="p-5">
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart
                        data={salesInsights.forecast.predictions.map(
                          (pred) => ({
                            date: new Date(pred.date).toLocaleDateString(
                              "id-ID",
                              { day: "numeric", month: "short" },
                            ),
                            prediksi: pred.predicted_revenue,
                            batasAtas: pred.upper_bound,
                            batasBawah: pred.lower_bound,
                          }),
                        )}
                        margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          dataKey="date"
                          stroke="#64748b"
                          style={{ fontSize: "12px" }}
                        />
                        <YAxis
                          stroke="#64748b"
                          style={{ fontSize: "12px" }}
                          tickFormatter={(value) =>
                            `${(value / 1000000).toFixed(1)}jt`
                          }
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.98)",
                            border: "1px solid #e2e8f0",
                            borderRadius: "12px",
                            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                          }}
                          formatter={(value) => [
                            formatCurrency(value as number),
                            "",
                          ]}
                        />
                        <Legend
                          wrapperStyle={{
                            fontSize: "12px",
                            paddingTop: "10px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="batasAtas"
                          fill="#8b5cf6"
                          stroke="none"
                          fillOpacity={0.1}
                          name="Range Atas"
                        />
                        <Area
                          type="monotone"
                          dataKey="batasBawah"
                          fill="#8b5cf6"
                          stroke="none"
                          fillOpacity={0.1}
                          name="Range Bawah"
                        />
                        <Line
                          type="monotone"
                          dataKey="prediksi"
                          stroke="#8b5cf6"
                          strokeWidth={3}
                          dot={{ fill: "#8b5cf6", r: 4 }}
                          activeDot={{ r: 6 }}
                          name="Prediksi Revenue"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Forecast Table */}
              {salesInsights?.forecast?.predictions && (
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                  <div className="p-5 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-800">
                      Prediksi Harian
                    </h3>
                    <p className="text-sm text-slate-500">
                      Metode: {salesInsights.forecast.method} | Confidence:{" "}
                      {salesInsights.forecast.model_confidence}
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left p-4 text-sm font-medium text-slate-600">
                            Tanggal
                          </th>
                          <th className="text-right p-4 text-sm font-medium text-slate-600">
                            Prediksi Revenue
                          </th>
                          <th className="text-right p-4 text-sm font-medium text-slate-600">
                            Range
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesInsights.forecast.predictions.map((pred, idx) => (
                          <tr key={idx} className="border-t border-slate-100">
                            <td className="p-4 text-sm text-slate-800">
                              {new Date(pred.date).toLocaleDateString("id-ID", {
                                weekday: "long",
                                day: "numeric",
                                month: "short",
                              })}
                            </td>
                            <td className="p-4 text-sm text-right font-medium text-slate-800">
                              {formatCurrency(pred.predicted_revenue)}
                            </td>
                            <td className="p-4 text-sm text-right text-slate-500">
                              {formatCurrency(pred.lower_bound)} -{" "}
                              {formatCurrency(pred.upper_bound)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* AI Advice */}
              <AIAdviceCard
                advice={salesInsights?.ai_advice?.advice || ""}
                source={salesInsights?.ai_advice?.source || "fallback"}
                loading={loading}
              />
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === "inventory" && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard
                  title="Kritis"
                  value={
                    inventoryInsights?.recommendations?.summary?.critical_count?.toString() ||
                    "0"
                  }
                  icon={XCircle}
                  color="bg-red-500"
                  loading={loading}
                />
                <StatsCard
                  title="Perhatian"
                  value={
                    inventoryInsights?.recommendations?.summary?.warning_count?.toString() ||
                    "0"
                  }
                  icon={AlertTriangle}
                  color="bg-amber-500"
                  loading={loading}
                />
                <StatsCard
                  title="Sehat"
                  value={
                    inventoryInsights?.recommendations?.summary?.healthy_count?.toString() ||
                    "0"
                  }
                  icon={CheckCircle}
                  color="bg-green-500"
                  loading={loading}
                />
                <StatsCard
                  title="Overstock"
                  value={
                    inventoryInsights?.recommendations?.summary?.overstocked_count?.toString() ||
                    "0"
                  }
                  icon={Package}
                  color="bg-blue-500"
                  loading={loading}
                />
              </div>

              {/* Critical & Warning Items */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Critical */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <XCircle className="text-red-500" size={18} />
                    Produk Kritis
                  </h3>
                  <div className="space-y-3">
                    {loading ? (
                      <>
                        <Skeleton className="h-20" />
                        <Skeleton className="h-20" />
                      </>
                    ) : inventoryInsights?.recommendations?.recommendations
                        ?.critical?.length ? (
                      inventoryInsights.recommendations.recommendations.critical
                        .slice(0, 5)
                        .map((item) => (
                          <InventoryAlertItem
                            key={item.product_id}
                            name={item.product_name}
                            stock={item.current_stock}
                            status="critical"
                            recommendation={item.recommendation.action}
                          />
                        ))
                    ) : (
                      <p className="text-sm text-slate-500 text-center py-4">
                        Tidak ada produk kritis
                      </p>
                    )}
                  </div>
                </div>

                {/* Warning */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <AlertTriangle className="text-amber-500" size={18} />
                    Produk Perlu Perhatian
                  </h3>
                  <div className="space-y-3">
                    {loading ? (
                      <>
                        <Skeleton className="h-20" />
                        <Skeleton className="h-20" />
                      </>
                    ) : inventoryInsights?.recommendations?.recommendations
                        ?.warning?.length ? (
                      inventoryInsights.recommendations.recommendations.warning
                        .slice(0, 5)
                        .map((item) => (
                          <InventoryAlertItem
                            key={item.product_id}
                            name={item.product_name}
                            stock={item.current_stock}
                            status="warning"
                            recommendation={item.recommendation.action}
                          />
                        ))
                    ) : (
                      <p className="text-sm text-slate-500 text-center py-4">
                        Tidak ada produk yang perlu perhatian
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Advice */}
              <AIAdviceCard
                advice={inventoryInsights?.ai_advice?.advice || ""}
                source={inventoryInsights?.ai_advice?.source || "fallback"}
                loading={loading}
              />
            </div>
          )}

          {/* Anomalies Tab */}
          {activeTab === "anomalies" && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard
                  title="Total Anomali"
                  value={
                    anomalyInsights?.anomalies?.summary?.total_anomalies?.toString() ||
                    "0"
                  }
                  icon={AlertTriangle}
                  color="bg-purple-500"
                  loading={loading}
                />
                <StatsCard
                  title="Severity Tinggi"
                  value={
                    anomalyInsights?.anomalies?.summary?.high_severity?.toString() ||
                    "0"
                  }
                  icon={XCircle}
                  color="bg-red-500"
                  loading={loading}
                />
                <StatsCard
                  title="Severity Sedang"
                  value={
                    anomalyInsights?.anomalies?.summary?.medium_severity?.toString() ||
                    "0"
                  }
                  icon={AlertCircle}
                  color="bg-amber-500"
                  loading={loading}
                />
                <StatsCard
                  title="Severity Rendah"
                  value={
                    anomalyInsights?.anomalies?.summary?.low_severity?.toString() ||
                    "0"
                  }
                  icon={Info}
                  color="bg-blue-500"
                  loading={loading}
                />
              </div>

              {/* Anomaly List */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <h3 className="font-semibold text-slate-800 mb-4">
                  Anomali Terdeteksi
                </h3>
                <div className="space-y-3">
                  {loading ? (
                    <>
                      <Skeleton className="h-20" />
                      <Skeleton className="h-20" />
                      <Skeleton className="h-20" />
                    </>
                  ) : anomalyInsights?.anomalies?.anomalies?.length ? (
                    anomalyInsights.anomalies.anomalies.map((anomaly, idx) => (
                      <AnomalyItem
                        key={idx}
                        type={anomaly.type}
                        description={anomaly.description}
                        severity={anomaly.severity}
                        timestamp={anomaly.timestamp}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 text-center py-8">
                      Tidak ada anomali terdeteksi dalam 7 hari terakhir
                    </p>
                  )}
                </div>
              </div>

              {/* AI Advice */}
              <AIAdviceCard
                advice={anomalyInsights?.ai_advice?.advice || ""}
                source={anomalyInsights?.ai_advice?.source || "fallback"}
                loading={loading}
              />
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default AIInsightsPage;
