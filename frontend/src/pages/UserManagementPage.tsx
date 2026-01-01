import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  UserCheck,
  UserX,
  Edit2,
  Shield,
  User as UserIcon,
  AlertCircle,
  X,
  Trash2,
  Key,
} from "lucide-react";
import { userService } from "../services/user.service";
import { User, CreateUserInput, UpdateUserInput, Role } from "../types/user";
import { useAuth } from "../contexts/AuthContext";

type RoleOption = {
  value: Role;
  label: string;
  description: string;
  color: string;
};

const roleOptions: RoleOption[] = [
  {
    value: "ADMIN",
    label: "Admin",
    description: "Akses penuh ke semua fitur",
    color: "text-red-600",
  },
  {
    value: "CASHIER",
    label: "Kasir",
    description: "Akses ke POS dan transaksi",
    color: "text-blue-600",
  },
  {
    value: "OWNER",
    label: "Owner",
    description: "Akses ke laporan keuangan",
    color: "text-purple-600",
  },
];

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "">("");
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | "">(
    ""
  );

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form state for create
  const [createFormData, setCreateFormData] = useState<CreateUserInput>({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "CASHIER",
  });

  // Form state for edit
  const [editFormData, setEditFormData] = useState<UpdateUserInput>({
    name: "",
    email: "",
    phone: "",
    role: "CASHIER",
  });

  // Form state for reset password
  const [newPassword, setNewPassword] = useState("");

  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [page, searchQuery, roleFilter, statusFilter]);

  // Auto-hide success message
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const filters: any = { page, limit };

      if (searchQuery) filters.search = searchQuery;
      if (roleFilter) filters.role = roleFilter;
      if (statusFilter)
        filters.isActive = statusFilter === "active" ? true : false;

      const data = await userService.getAllUsers(filters);

      setUsers(data.users);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal memuat data pengguna");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setSubmitting(true);

    try {
      await userService.createUser(createFormData);
      setShowCreateModal(false);
      setCreateFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "CASHIER",
      });
      setSuccess("User berhasil ditambahkan");
      fetchUsers();
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      } else {
        setError(err.response?.data?.message || "Gagal menambahkan pengguna");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setFormErrors({});
    setSubmitting(true);

    try {
      await userService.updateUser(selectedUser.id, editFormData);
      setShowEditModal(false);
      setSelectedUser(null);
      setSuccess("User berhasil diperbarui");
      fetchUsers();
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      } else {
        setError(err.response?.data?.message || "Gagal memperbarui pengguna");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setFormErrors({});
    setSubmitting(true);

    try {
      await userService.resetPassword(selectedUser.id, { newPassword });
      setShowResetPasswordModal(false);
      setSelectedUser(null);
      setNewPassword("");
      setSuccess(`Password ${selectedUser.name} berhasil direset`);
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      } else {
        setError(err.response?.data?.message || "Gagal mereset password");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    if (user.id === currentUser?.id) {
      setError("Tidak dapat menonaktifkan akun sendiri");
      return;
    }

    if (
      !confirm(
        `Apakah Anda yakin ingin ${
          user.isActive ? "menonaktifkan" : "mengaktifkan"
        } akun ${user.name}?`
      )
    ) {
      return;
    }

    try {
      await userService.toggleUserStatus(user.id);
      setSuccess(
        user.isActive
          ? `${user.name} berhasil dinonaktifkan`
          : `${user.name} berhasil diaktifkan`
      );
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal mengubah status");
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (user.id === currentUser?.id) {
      setError("Tidak dapat menghapus akun sendiri");
      return;
    }

    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus akun ${user.name}? Tindakan ini tidak dapat dibatalkan!`
      )
    ) {
      return;
    }

    try {
      await userService.deleteUser(user.id);
      setSuccess(`${user.name} berhasil dihapus`);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menghapus pengguna");
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const openResetPasswordModal = (user: User) => {
    setSelectedUser(user);
    setNewPassword("");
    setFormErrors({});
    setShowResetPasswordModal(true);
  };

  const getRoleBadge = (role: Role) => {
    const roleOption = roleOptions.find((r) => r.value === role);
    if (!roleOption) return null;

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          role === "ADMIN"
            ? "bg-red-100 text-red-700"
            : role === "OWNER"
            ? "bg-purple-100 text-purple-700"
            : "bg-blue-100 text-blue-700"
        }`}
      >
        {roleOption.label}
      </span>
    );
  };

  const isCurrentUser = (userId: string) => userId === currentUser?.id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen User</h1>
          <p className="text-gray-600 mt-1">
            Kelola pengguna dan hak akses sistem
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Tambah User
        </button>
      </div>

      {/* Success Alert */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3"
        >
          <UserCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-green-800">{success}</p>
          </div>
          <button
            onClick={() => setSuccess("")}
            className="text-green-600 hover:text-green-800"
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      )}

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-800">{error}</p>
          </div>
          <button
            onClick={() => setError("")}
            className="text-red-600 hover:text-red-800"
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as Role | "");
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Semua Role</option>
            {roleOptions.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as "active" | "inactive" | "");
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Memuat data...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Tidak ada pengguna ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pengguna
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Terdaftar
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-gray-50 ${
                      isCurrentUser(user.id) ? "bg-blue-50/50" : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                            {user.name}
                            {isCurrentUser(user.id) && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                Anda
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="text-xs text-gray-400">
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {user.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => openEditModal(user)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Edit User"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Reset Password Button */}
                        <button
                          onClick={() => openResetPasswordModal(user)}
                          className="text-orange-600 hover:text-orange-800 p-1"
                          title="Reset Password"
                        >
                          <Key className="w-4 h-4" />
                        </button>

                        {/* Toggle Status Button - disabled for current user */}
                        <button
                          onClick={() => handleToggleStatus(user)}
                          disabled={isCurrentUser(user.id)}
                          className={`p-1 ${
                            isCurrentUser(user.id)
                              ? "text-gray-300 cursor-not-allowed"
                              : user.isActive
                              ? "text-amber-600 hover:text-amber-800"
                              : "text-green-600 hover:text-green-800"
                          }`}
                          title={
                            isCurrentUser(user.id)
                              ? "Tidak dapat mengubah status akun sendiri"
                              : user.isActive
                              ? "Nonaktifkan"
                              : "Aktifkan"
                          }
                        >
                          {user.isActive ? (
                            <UserX className="w-4 h-4" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
                        </button>

                        {/* Delete Button - disabled for current user */}
                        <button
                          onClick={() => handleDeleteUser(user)}
                          disabled={isCurrentUser(user.id)}
                          className={`p-1 ${
                            isCurrentUser(user.id)
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-red-600 hover:text-red-800"
                          }`}
                          title={
                            isCurrentUser(user.id)
                              ? "Tidak dapat menghapus akun sendiri"
                              : "Hapus User"
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Menampilkan {users.length} dari {total} pengguna
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sebelumnya
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-lg ${
                    page === p
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Tambah User Baru
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={createFormData.name}
                    onChange={(e) =>
                      setCreateFormData({
                        ...createFormData,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {formErrors.name && (
                    <p className="text-red-600 text-sm mt-1">
                      {formErrors.name[0]}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={createFormData.email}
                    onChange={(e) =>
                      setCreateFormData({
                        ...createFormData,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {formErrors.email && (
                    <p className="text-red-600 text-sm mt-1">
                      {formErrors.email[0]}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={createFormData.password}
                    onChange={(e) =>
                      setCreateFormData({
                        ...createFormData,
                        password: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Min. 8 karakter"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Harus mengandung huruf besar, huruf kecil, dan angka
                  </p>
                  {formErrors.password && (
                    <p className="text-red-600 text-sm mt-1">
                      {formErrors.password[0]}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    value={createFormData.phone}
                    onChange={(e) =>
                      setCreateFormData({
                        ...createFormData,
                        phone: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {roleOptions.map((role) => (
                      <label
                        key={role.value}
                        className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          createFormData.role === role.value
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={role.value}
                          checked={createFormData.role === role.value}
                          onChange={(e) =>
                            setCreateFormData({
                              ...createFormData,
                              role: e.target.value as Role,
                            })
                          }
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Shield className={`w-4 h-4 ${role.color}`} />
                            <span className="font-medium text-gray-900">
                              {role.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {role.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Edit User</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleEditUser} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {formErrors.name && (
                    <p className="text-red-600 text-sm mt-1">
                      {formErrors.name[0]}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {formErrors.email && (
                    <p className="text-red-600 text-sm mt-1">
                      {formErrors.email[0]}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        phone: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>

                {/* Role - disabled for current user */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                    {isCurrentUser(selectedUser.id) && (
                      <span className="text-xs text-gray-500 ml-2">
                        (tidak dapat mengubah role sendiri)
                      </span>
                    )}
                  </label>
                  <div className="space-y-2">
                    {roleOptions.map((role) => (
                      <label
                        key={role.value}
                        className={`flex items-start gap-3 p-3 border-2 rounded-lg transition-all ${
                          isCurrentUser(selectedUser.id)
                            ? "cursor-not-allowed opacity-60"
                            : "cursor-pointer"
                        } ${
                          editFormData.role === role.value
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="editRole"
                          value={role.value}
                          checked={editFormData.role === role.value}
                          disabled={isCurrentUser(selectedUser.id)}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              role: e.target.value as Role,
                            })
                          }
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Shield className={`w-4 h-4 ${role.color}`} />
                            <span className="font-medium text-gray-900">
                              {role.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {role.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedUser(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Reset Password
                </h2>
                <button
                  onClick={() => {
                    setShowResetPasswordModal(false);
                    setSelectedUser(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Perhatian:</strong> Anda akan mereset password untuk{" "}
                  <strong>{selectedUser.name}</strong> ({selectedUser.email})
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password Baru <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Min. 8 karakter"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Harus mengandung huruf besar, huruf kecil, dan angka
                  </p>
                  {formErrors.newPassword && (
                    <p className="text-red-600 text-sm mt-1">
                      {formErrors.newPassword[0]}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetPasswordModal(false);
                      setSelectedUser(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Mereset..." : "Reset Password"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
