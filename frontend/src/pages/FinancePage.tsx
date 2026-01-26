import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  RefreshCw,
  BarChart3,
  PieChart,
  Plus,
  X,
  Trash2,
  Edit3,
  Receipt,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { financeService } from "../services/finance.service";
import { expenseService } from "../services/expense.service";
import {
  FinanceSummary,
  SalesReport,
  TopProductsReport,
  PaymentMethodStats,
  CategorySalesReport,
  FinanceFilters,
} from "../types/finance";
import {
  Expense,
  ExpenseCategory,
  ExpenseSummary,
  CreateExpenseInput,
} from "../types/expense";

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Format percentage
const formatPercent = (value: number) => {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
};

// Format date
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
};

type Period = "today" | "week" | "month" | "year";
type ActiveTab = "overview" | "expenses";

const FinancePage = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [period, setPeriod] = useState<Period>("month");
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [topProducts, setTopProducts] = useState<TopProductsReport | null>(
    null,
  );
  const [paymentStats, setPaymentStats] = useState<PaymentMethodStats | null>(
    null,
  );
  const [categorySales, setCategorySales] =
    useState<CategorySalesReport | null>(null);
  const [error, setError] = useState("");

  // Expense states
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(
    [],
  );
  const [expenseSummary, setExpenseSummary] = useState<ExpenseSummary | null>(
    null,
  );
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expenseForm, setExpenseForm] = useState<CreateExpenseInput>({
    category: "",
    amount: 0,
    description: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (activeTab === "overview") {
      loadData();
    } else {
      loadExpenses();
    }
  }, [period, activeTab]);

  useEffect(() => {
    loadExpenseCategories();
  }, []);

  const loadExpenseCategories = async () => {
    try {
      const categories = await expenseService.getCategories();
      setExpenseCategories(categories);
    } catch (err) {
      console.error("Failed to load expense categories", err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError("");
    const filters: FinanceFilters = { period };

    try {
      const [
        summaryData,
        salesData,
        topProductsData,
        paymentData,
        categoryData,
        expenseSummaryData,
      ] = await Promise.all([
        financeService.getSummary(filters),
        financeService.getSalesReport(filters),
        financeService.getTopProducts({ ...filters, limit: 5 }),
        financeService.getPaymentMethodStats(filters),
        financeService.getCategorySales(filters),
        expenseService.getSummary(),
      ]);

      setSummary(summaryData);
      setSalesReport(salesData);
      setTopProducts(topProductsData);
      setPaymentStats(paymentData);
      setCategorySales(categoryData);
      setExpenseSummary(expenseSummaryData);
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal memuat data keuangan");
    } finally {
      setLoading(false);
    }
  };

  const loadExpenses = async () => {
    setExpenseLoading(true);
    setError("");
    try {
      const [expensesData, summaryData] = await Promise.all([
        expenseService.getExpenses({ limit: 20 }),
        expenseService.getSummary(),
      ]);
      setExpenses(expensesData.data);
      setExpenseSummary(summaryData);
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal memuat data pengeluaran");
    } finally {
      setExpenseLoading(false);
    }
  };

  const handleOpenExpenseModal = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense);
      setExpenseForm({
        category: expense.category,
        amount: Number(expense.amount),
        description: expense.description || "",
        date: new Date(expense.date).toISOString().split("T")[0],
      });
    } else {
      setEditingExpense(null);
      setExpenseForm({
        category: expenseCategories[0]?.value || "",
        amount: 0,
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
    }
    setShowExpenseModal(true);
  };

  const handleCloseExpenseModal = () => {
    setShowExpenseModal(false);
    setEditingExpense(null);
  };

  const handleSubmitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.category || expenseForm.amount <= 0) return;

    setSubmitting(true);
    try {
      if (editingExpense) {
        await expenseService.updateExpense(editingExpense.id, expenseForm);
      } else {
        await expenseService.createExpense(expenseForm);
      }
      handleCloseExpenseModal();
      loadExpenses();
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menyimpan pengeluaran");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pengeluaran ini?")) return;
    try {
      await expenseService.deleteExpense(id);
      loadExpenses();
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menghapus pengeluaran");
    }
  };

  const periodOptions = [
    { value: "today", label: "Hari Ini" },
    { value: "week", label: "7 Hari" },
    { value: "month", label: "30 Hari" },
    { value: "year", label: "1 Tahun" },
  ];

  // Payment method labels
  const paymentMethodLabels: Record<string, string> = {
    CASH: "Tunai",
    CARD: "Kartu",
    QRIS: "QRIS",
    TRANSFER: "Transfer",
    OTHER: "Lainnya",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-600">Memuat data keuangan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan Keuangan</h1>
          <p className="text-gray-500 mt-1">
            Pantau performa bisnis dan analisis keuangan
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === "overview" && (
            <div className="flex bg-white rounded-xl border border-gray-200 p-1">
              {periodOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPeriod(opt.value as Period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    period === opt.value
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
          {activeTab === "expenses" && (
            <button
              onClick={() => handleOpenExpenseModal()}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
            >
              <Plus className="w-5 h-5" />
              <span>Catat Pengeluaran</span>
            </button>
          )}
          <button
            onClick={activeTab === "overview" ? loadData : loadExpenses}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-white rounded-xl border border-gray-200 p-1 w-fit">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === "overview"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Ringkasan
        </button>
        <button
          onClick={() => setActiveTab("expenses")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === "expenses"
              ? "bg-red-600 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Receipt className="w-4 h-4" />
          Pengeluaran
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800">
          {error}
        </div>
      )}

      {/* Loading */}
      {(loading || expenseLoading) && (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-gray-600">Memuat data...</p>
          </div>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === "overview" && !loading && summary && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Revenue Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <span
                  className={`flex items-center gap-1 text-sm font-medium ${
                    summary.revenue.growth >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {summary.revenue.growth >= 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {formatPercent(summary.revenue.growth)}
                </span>
              </div>
              <p className="text-gray-500 text-sm mb-1">Total Pendapatan</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary.revenue.total)}
              </p>
            </div>

            {/* Expense Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-100 rounded-xl">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <p className="text-gray-500 text-sm mb-1">Total Pengeluaran</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(expenseSummary?.total || 0)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {expenseSummary?.count || 0} catatan
              </p>
            </div>

            {/* Transactions Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
                <span
                  className={`flex items-center gap-1 text-sm font-medium ${
                    summary.transactions.growth >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {summary.transactions.growth >= 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {formatPercent(summary.transactions.growth)}
                </span>
              </div>
              <p className="text-gray-500 text-sm mb-1">Total Transaksi</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary.transactions.total.toLocaleString("id-ID")}
              </p>
            </div>

            {/* Net Profit Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-purple-600">
                  {summary.profit.margin.toFixed(1)}% margin
                </span>
              </div>
              <p className="text-gray-500 text-sm mb-1">Laba Bersih</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(
                  summary.profit.gross - (expenseSummary?.total || 0),
                )}
              </p>
            </div>

            {/* Items Sold Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Package className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <p className="text-gray-500 text-sm mb-1">Produk Terjual</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary.itemsSold.toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Grafik Penjualan
                    </h3>
                    <p className="text-sm text-gray-500">Pendapatan harian</p>
                  </div>
                </div>
              </div>

              {salesReport && salesReport.data.length > 0 ? (
                <ResponsiveContainer width="100%" height={256}>
                  <LineChart
                    data={salesReport.data.slice(-14).map((day) => ({
                      ...day,
                      label: formatDate(day.date),
                    }))}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="label"
                      stroke="#64748b"
                      style={{ fontSize: "12px" }}
                    />
                    <YAxis
                      stroke="#64748b"
                      style={{ fontSize: "12px" }}
                      tickFormatter={(value) =>
                        value >= 1000000
                          ? `${(value / 1000000).toFixed(1)}jt`
                          : `${(value / 1000).toFixed(0)}rb`
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.98)",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      }}
                      formatter={(value, name) => {
                        if (name === "revenue")
                          return [
                            formatCurrency(value as number),
                            "Pendapatan",
                          ];
                        return [value, "Transaksi"];
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ fill: "#2563eb", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400">
                  Tidak ada data penjualan
                </div>
              )}
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Metode Pembayaran
                  </h3>
                  <p className="text-sm text-gray-500">Distribusi pembayaran</p>
                </div>
              </div>

              {paymentStats && paymentStats.data.length > 0 ? (
                <div className="space-y-4">
                  {paymentStats.data.map((stat) => (
                    <div key={stat.method}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">
                          {paymentMethodLabels[stat.method] || stat.method}
                        </span>
                        <span className="font-medium text-gray-900">
                          {stat.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all"
                          style={{ width: `${stat.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {stat.count} transaksi • {formatCurrency(stat.revenue)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-400">
                  Tidak ada data
                </div>
              )}
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Products */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Produk Terlaris
                  </h3>
                  <p className="text-sm text-gray-500">Top 5 produk</p>
                </div>
              </div>

              {topProducts && topProducts.data.length > 0 ? (
                <div className="space-y-3">
                  {topProducts.data.map((product, index) => (
                    <div
                      key={product.productId}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                          index === 0
                            ? "bg-yellow-100 text-yellow-700"
                            : index === 1
                              ? "bg-gray-200 text-gray-700"
                              : index === 2
                                ? "bg-orange-100 text-orange-700"
                                : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        #{product.rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {product.productName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {product.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 text-sm">
                          {formatCurrency(product.revenue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-400">
                  Tidak ada data produk
                </div>
              )}
            </div>

            {/* Category Sales */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <PieChart className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Kategori Produk
                  </h3>
                  <p className="text-sm text-gray-500">Distribusi penjualan</p>
                </div>
              </div>

              {categorySales && categorySales.data.length > 0 ? (
                <div className="space-y-3">
                  {categorySales.data.slice(0, 5).map((cat) => (
                    <div
                      key={cat.categoryId}
                      className="flex items-center gap-3"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700 truncate">
                            {cat.name}
                          </span>
                          <span className="font-medium text-gray-900">
                            {cat.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${cat.percentage}%`,
                              backgroundColor: cat.color,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-400">
                  Tidak ada data kategori
                </div>
              )}
            </div>

            {/* Expense Summary */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Receipt className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Kategori Pengeluaran
                  </h3>
                  <p className="text-sm text-gray-500">
                    Distribusi pengeluaran
                  </p>
                </div>
              </div>

              {expenseSummary && expenseSummary.byCategory.length > 0 ? (
                <div className="space-y-3">
                  {expenseSummary.byCategory.slice(0, 5).map((cat) => (
                    <div key={cat.category} className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700 truncate">
                            {cat.label}
                          </span>
                          <span className="font-medium text-gray-900">
                            {cat.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${cat.percentage}%`,
                              backgroundColor: cat.color,
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatCurrency(cat.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-400">
                  Belum ada pengeluaran
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Expenses Tab */}
      {activeTab === "expenses" && !expenseLoading && (
        <>
          {/* Expense Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-100 rounded-xl">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <p className="text-gray-500 text-sm mb-1">
                Total Pengeluaran Bulan Ini
              </p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(expenseSummary?.total || 0)}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Receipt className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-gray-500 text-sm mb-1">Jumlah Catatan</p>
              <p className="text-2xl font-bold text-gray-900">
                {expenseSummary?.count || 0}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <PieChart className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-gray-500 text-sm mb-1">Kategori Terbesar</p>
              <p className="text-2xl font-bold text-gray-900">
                {expenseSummary?.byCategory[0]?.label || "-"}
              </p>
            </div>
          </div>

          {/* Expense List */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">
                Riwayat Pengeluaran
              </h3>
            </div>
            {expenses.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {expenses.map((expense) => {
                  const category = expenseCategories.find(
                    (c) => c.value === expense.category,
                  );
                  return (
                    <div
                      key={expense.id}
                      className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${category?.color}20` }}
                      >
                        <Receipt
                          className="w-5 h-5"
                          style={{ color: category?.color }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">
                          {category?.label || expense.category}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {expense.description || "Tidak ada keterangan"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(expense.date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <p className="font-semibold text-red-600">
                        -{formatCurrency(Number(expense.amount))}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenExpenseModal(expense)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-400">
                <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Belum ada catatan pengeluaran</p>
                <button
                  onClick={() => handleOpenExpenseModal()}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                >
                  Catat Pengeluaran Pertama
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">
                {editingExpense ? "Edit Pengeluaran" : "Catat Pengeluaran"}
              </h3>
              <button
                onClick={handleCloseExpenseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitExpense} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori
                </label>
                <select
                  value={expenseForm.category}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, category: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="">Pilih Kategori</option>
                  {expenseCategories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah (Rp)
                </label>
                <input
                  type="number"
                  value={expenseForm.amount || ""}
                  onChange={(e) =>
                    setExpenseForm({
                      ...expenseForm,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, date: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keterangan
                </label>
                <textarea
                  value={expenseForm.description}
                  onChange={(e) =>
                    setExpenseForm({
                      ...expenseForm,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  placeholder="Contoh: Bayar listrik bulan Desember"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseExpenseModal}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingExpense ? "Update" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancePage;
