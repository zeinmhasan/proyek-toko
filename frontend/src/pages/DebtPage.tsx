import React, { useState, useEffect } from "react";
import {
  User,
  Phone,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  CheckCircle2,
  Clock,
  X,
  Loader2,
  AlertCircle,
  Trash2,
  Edit3,
  CreditCard,
  Eye,
  Search,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { debtService } from "../services/debt.service";
import {
  Debt,
  DebtSummary,
  CreateDebtInput,
  UpdateDebtInput,
  AddPaymentInput,
  DebtPayment,
} from "../types/debt";

const DebtPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"RECEIVABLE" | "PAYABLE">(
    "RECEIVABLE"
  );
  const [debts, setDebts] = useState<Debt[]>([]);
  const [summary, setSummary] = useState<DebtSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState<CreateDebtInput>({
    type: "RECEIVABLE",
    personName: "",
    personPhone: "",
    amount: 0,
    description: "",
    dueDate: "",
  });

  const [paymentData, setPaymentData] = useState<AddPaymentInput>({
    amount: 0,
    paymentMethod: "CASH",
    notes: "",
  });

  // Fetch data
  const fetchDebts = async () => {
    try {
      setLoading(true);
      const [debtsRes, summaryRes] = await Promise.all([
        debtService.getDebts({ type: activeTab }),
        debtService.getSummary(),
      ]);
      setDebts(debtsRes.data);
      setSummary(summaryRes);
      setError(null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Gagal memuat data hutang/piutang";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebts();
  }, [activeTab]);

  // Filter debts by search
  const filteredDebts = debts.filter(
    (debt) =>
      debt.personName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      debt.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset form
  const resetForm = () => {
    setFormData({
      type: activeTab,
      personName: "",
      personPhone: "",
      amount: 0,
      description: "",
      dueDate: "",
    });
    setIsEditing(false);
    setSelectedDebt(null);
  };

  // Open modal for create
  const openCreateModal = () => {
    resetForm();
    setFormData((prev) => ({ ...prev, type: activeTab }));
    setIsModalOpen(true);
  };

  // Open modal for edit
  const openEditModal = (debt: Debt) => {
    setSelectedDebt(debt);
    setIsEditing(true);
    setFormData({
      type: debt.type,
      personName: debt.personName,
      personPhone: debt.personPhone || "",
      amount: debt.amount,
      description: debt.description || "",
      dueDate: debt.dueDate ? debt.dueDate.split("T")[0] : "",
    });
    setIsModalOpen(true);
  };

  // Open payment modal
  const openPaymentModal = (debt: Debt) => {
    setSelectedDebt(debt);
    setPaymentData({
      amount: debt.remainingAmount,
      paymentMethod: "CASH",
      notes: "",
    });
    setIsPaymentModalOpen(true);
  };

  // Open detail modal
  const openDetailModal = (debt: Debt) => {
    setSelectedDebt(debt);
    setIsDetailModalOpen(true);
  };

  // Open delete modal
  const openDeleteModal = (debt: Debt) => {
    setSelectedDebt(debt);
    setIsDeleteModalOpen(true);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isEditing && selectedDebt) {
        const updateData: UpdateDebtInput = {
          personName: formData.personName,
          personPhone: formData.personPhone,
          description: formData.description,
          dueDate: formData.dueDate,
        };
        await debtService.updateDebt(selectedDebt.id, updateData);
      } else {
        await debtService.createDebt(formData);
      }
      await fetchDebts();
      setIsModalOpen(false);
      resetForm();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Gagal menyimpan data";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle payment submit
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebt) return;

    setSubmitting(true);
    try {
      await debtService.addPayment(selectedDebt.id, paymentData);
      await fetchDebts();
      setIsPaymentModalOpen(false);
      setSelectedDebt(null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Gagal mencatat pembayaran";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedDebt) return;

    setSubmitting(true);
    try {
      await debtService.deleteDebt(selectedDebt.id);
      await fetchDebts();
      setIsDeleteModalOpen(false);
      setSelectedDebt(null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Gagal menghapus data";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete payment
  const handleDeletePayment = async (paymentId: string) => {
    setSubmitting(true);
    try {
      await debtService.deletePayment(paymentId);
      // Refresh selected debt detail
      if (selectedDebt) {
        const res = await debtService.getDebtById(selectedDebt.id);
        setSelectedDebt(res);
      }
      await fetchDebts();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Gagal menghapus pembayaran";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold flex items-center gap-1.5">
            <CheckCircle2 size={16} /> Lunas
          </span>
        );
      case "OVERDUE":
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold flex items-center gap-1.5">
            <AlertTriangle size={16} /> Lewat Jatuh Tempo
          </span>
        );
      case "PARTIAL":
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold flex items-center gap-1.5">
            <CreditCard size={16} /> Sebagian Dibayar
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-bold flex items-center gap-1.5">
            <Clock size={16} /> Belum Lunas
          </span>
        );
    }
  };

  // Format date
  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID").format(amount);
  };

  if (loading && debts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Buku Hutang & Piutang
          </h1>
          <p className="text-slate-500">
            Catatan hutang pelanggan dan hutang ke supplier
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
        >
          <Plus size={20} />
          <span className="font-medium">Catat Baru</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <X size={20} />
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => setActiveTab("RECEIVABLE")}
          className={`p-6 rounded-2xl border cursor-pointer transition-all ${
            activeTab === "RECEIVABLE"
              ? "bg-green-50 border-green-200 ring-2 ring-green-500 ring-opacity-50"
              : "bg-white border-slate-100 hover:border-green-200"
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <ArrowDownRight size={20} />
            </div>
            <span className="font-medium text-slate-600">
              Piutang (Yang Kita Tagih)
            </span>
          </div>
          <h3 className="text-3xl font-bold text-green-600">
            Rp {formatCurrency(summary?.receivables?.total || 0)}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {summary?.receivables?.count || 0} catatan aktif
          </p>
        </div>

        <div
          onClick={() => setActiveTab("PAYABLE")}
          className={`p-6 rounded-2xl border cursor-pointer transition-all ${
            activeTab === "PAYABLE"
              ? "bg-red-50 border-red-200 ring-2 ring-red-500 ring-opacity-50"
              : "bg-white border-slate-100 hover:border-red-200"
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <ArrowUpRight size={20} />
            </div>
            <span className="font-medium text-slate-600">
              Hutang (Yang Kita Bayar)
            </span>
          </div>
          <h3 className="text-3xl font-bold text-red-600">
            Rp {formatCurrency(summary?.payables?.total || 0)}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {summary?.payables?.count || 0} catatan aktif
          </p>
        </div>

        <div className="p-6 rounded-2xl border bg-white border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <DollarSign size={20} />
            </div>
            <span className="font-medium text-slate-600">Posisi Bersih</span>
          </div>
          <h3
            className={`text-3xl font-bold ${
              (summary?.netPosition || 0) >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            Rp {formatCurrency(Math.abs(summary?.netPosition || 0))}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {(summary?.netPosition || 0) >= 0
              ? "Kita lebih banyak menerima"
              : "Kita lebih banyak berhutang"}
          </p>
        </div>
      </div>

      {/* Overdue Alert */}
      {summary &&
        (summary.receivables?.overdue || 0) + (summary.payables?.overdue || 0) >
          0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
            <AlertTriangle size={20} />
            <span>
              <strong>
                {(summary.receivables?.overdue || 0) +
                  (summary.payables?.overdue || 0)}
              </strong>{" "}
              hutang/piutang sudah melewati jatuh tempo!
            </span>
          </div>
        )}

      {/* Search Bar */}
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Cari nama atau keterangan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* List Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800">
            Daftar{" "}
            {activeTab === "RECEIVABLE"
              ? "Piutang Pelanggan"
              : "Hutang ke Supplier"}
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredDebts.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <User size={48} className="mx-auto mb-4 opacity-50" />
              <p>
                Tidak ada data{" "}
                {activeTab === "RECEIVABLE" ? "piutang" : "hutang"}
              </p>
            </div>
          ) : (
            filteredDebts.map((debt) => (
              <div
                key={debt.id}
                className="p-6 hover:bg-blue-50/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-2xl ${
                      debt.type === "RECEIVABLE"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    } group-hover:scale-110 transition-transform duration-300`}
                  >
                    <User size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">
                      {debt.personName}
                    </h4>
                    {debt.description && (
                      <p className="text-slate-500 mb-2 font-medium">
                        {debt.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3 text-sm">
                      {debt.dueDate && (
                        <div className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                          <Calendar size={14} />
                          <span>Jatuh Tempo: {formatDate(debt.dueDate)}</span>
                        </div>
                      )}
                      {debt.personPhone && (
                        <div className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                          <Phone size={14} />
                          <span>{debt.personPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div className="text-right">
                    <p className="text-sm text-slate-500 mb-1 font-medium">
                      {debt.paidAmount > 0 ? "Sisa" : "Jumlah"}
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        debt.type === "RECEIVABLE"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      Rp {formatCurrency(debt.remainingAmount)}
                    </p>
                    {debt.paidAmount > 0 && (
                      <p className="text-xs text-slate-400">
                        dari Rp {formatCurrency(debt.amount)}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(debt.status)}

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openDetailModal(debt)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Lihat Detail"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => openEditModal(debt)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(debt)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {debt.status !== "PAID" && (
                      <button
                        onClick={() => openPaymentModal(debt)}
                        className="px-4 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all flex items-center gap-1"
                      >
                        <CreditCard size={16} />
                        Bayar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Catat Hutang/Piutang */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <form onSubmit={handleSubmit}>
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">
                  {isEditing
                    ? "Edit Data"
                    : activeTab === "RECEIVABLE"
                    ? "Catat Piutang Baru"
                    : "Catat Hutang Baru"}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {!isEditing && (
                  <div className="p-3 bg-blue-50 text-blue-700 rounded-xl text-sm">
                    Mencatat{" "}
                    <strong>
                      {formData.type === "RECEIVABLE"
                        ? "Piutang (Orang berhutang ke kita)"
                        : "Hutang (Kita berhutang ke orang)"}
                    </strong>
                  </div>
                )}

                {!isEditing && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Jenis
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type: e.target.value as "RECEIVABLE" | "PAYABLE",
                        })
                      }
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="RECEIVABLE">
                        Piutang (Orang hutang ke kita)
                      </option>
                      <option value="PAYABLE">
                        Hutang (Kita hutang ke orang)
                      </option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nama{" "}
                    {formData.type === "RECEIVABLE"
                      ? "Pelanggan"
                      : "Supplier/Pemberi Hutang"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.personName}
                    onChange={(e) =>
                      setFormData({ ...formData, personName: e.target.value })
                    }
                    placeholder="Nama Lengkap"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    value={formData.personPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, personPhone: e.target.value })
                    }
                    placeholder="08..."
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {!isEditing && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Jumlah (Rp)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.amount || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          amount: Number(e.target.value),
                        })
                      }
                      placeholder="0"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Jatuh Tempo
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Keterangan
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Contoh: Pembelian bahan baku"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isEditing ? "Update" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pembayaran */}
      {isPaymentModalOpen && selectedDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <form onSubmit={handlePaymentSubmit}>
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">
                  Catat Pembayaran
                </h3>
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500">
                    {selectedDebt.type === "RECEIVABLE"
                      ? "Piutang dari"
                      : "Hutang ke"}
                  </p>
                  <p className="font-bold text-lg text-slate-800">
                    {selectedDebt.personName}
                  </p>
                  <p className="text-sm text-slate-500 mt-2">Sisa hutang:</p>
                  <p
                    className={`font-bold text-xl ${
                      selectedDebt.type === "RECEIVABLE"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    Rp {formatCurrency(selectedDebt.remainingAmount)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Jumlah Bayar (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={selectedDebt.remainingAmount}
                    value={paymentData.amount || ""}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        amount: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Metode Pembayaran
                  </label>
                  <select
                    value={paymentData.paymentMethod}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        paymentMethod: e.target.value as
                          | "CASH"
                          | "TRANSFER"
                          | "QRIS",
                      })
                    }
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CASH">Tunai</option>
                    <option value="TRANSFER">Transfer</option>
                    <option value="QRIS">QRIS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Catatan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={paymentData.notes}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, notes: e.target.value })
                    }
                    placeholder="Catatan pembayaran..."
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Catat Pembayaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail */}
      {isDetailModalOpen && selectedDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">
                Detail{" "}
                {selectedDebt.type === "RECEIVABLE" ? "Piutang" : "Hutang"}
              </h3>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-xl ${
                    selectedDebt.type === "RECEIVABLE"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  <User size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-slate-800">
                    {selectedDebt.personName}
                  </h4>
                  {selectedDebt.personPhone && (
                    <p className="text-slate-500">{selectedDebt.personPhone}</p>
                  )}
                </div>
                {getStatusBadge(selectedDebt.status)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500">Total</p>
                  <p className="font-bold text-lg text-slate-800">
                    Rp {formatCurrency(selectedDebt.amount)}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500">Sudah Dibayar</p>
                  <p className="font-bold text-lg text-green-600">
                    Rp {formatCurrency(selectedDebt.paidAmount)}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500">Sisa</p>
                  <p
                    className={`font-bold text-lg ${
                      selectedDebt.remainingAmount > 0
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    Rp {formatCurrency(selectedDebt.remainingAmount)}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500">Jatuh Tempo</p>
                  <p className="font-bold text-lg text-slate-800">
                    {formatDate(selectedDebt.dueDate)}
                  </p>
                </div>
              </div>

              {selectedDebt.description && (
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">Keterangan</p>
                  <p className="text-slate-800">{selectedDebt.description}</p>
                </div>
              )}

              {/* Payment History */}
              {selectedDebt.payments && selectedDebt.payments.length > 0 && (
                <div>
                  <h5 className="font-bold text-slate-800 mb-3">
                    Riwayat Pembayaran
                  </h5>
                  <div className="space-y-2">
                    {selectedDebt.payments.map((payment: DebtPayment) => (
                      <div
                        key={payment.id}
                        className="p-3 bg-green-50 border border-green-100 rounded-xl flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-green-700">
                            Rp {formatCurrency(payment.amount)}
                          </p>
                          <p className="text-xs text-green-600">
                            {formatDate(payment.createdAt)} •{" "}
                            {payment.paymentMethod}
                            {payment.notes && ` • ${payment.notes}`}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeletePayment(payment.id)}
                          disabled={submitting}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="flex-1 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
              >
                Tutup
              </button>
              {selectedDebt.status !== "PAID" && (
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    openPaymentModal(selectedDebt);
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CreditCard size={18} />
                  Catat Pembayaran
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Delete Confirmation */}
      {isDeleteModalOpen && selectedDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                Hapus{" "}
                {selectedDebt.type === "RECEIVABLE" ? "Piutang" : "Hutang"}?
              </h3>
              <p className="text-slate-500 mb-4">
                Anda yakin ingin menghapus catatan{" "}
                <strong>{selectedDebt.personName}</strong> senilai{" "}
                <strong>Rp {formatCurrency(selectedDebt.amount)}</strong>?
              </p>
              <p className="text-sm text-red-500">
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtPage;
