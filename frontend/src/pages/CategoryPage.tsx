import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
  Package,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { categoryService } from "../services/category.service";
import {
  Category,
  CreateCategoryData,
  UpdateCategoryData,
} from "../types/inventory";

// Predefined colors for categories
const COLORS = [
  "#EF4444", // Red
  "#F97316", // Orange
  "#F59E0B", // Amber
  "#EAB308", // Yellow
  "#84CC16", // Lime
  "#22C55E", // Green
  "#10B981", // Emerald
  "#14B8A6", // Teal
  "#06B6D4", // Cyan
  "#0EA5E9", // Sky
  "#3B82F6", // Blue
  "#6366F1", // Indigo
  "#8B5CF6", // Violet
  "#A855F7", // Purple
  "#D946EF", // Fuchsia
  "#EC4899", // Pink
];

interface CategoryFormData {
  name: string;
  description: string;
  color: string;
  icon: string;
}

const initialFormData: CategoryFormData = {
  name: "",
  description: "",
  color: "#3B82F6",
  icon: "",
};

export default function CategoryPage() {
  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [showDeleteError, setShowDeleteError] = useState(false);

  // Fetch categories
  const fetchCategories = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await categoryService.getAll({
        page,
        limit: 10,
        search: search || undefined,
        sortBy: "name",
        sortOrder: "asc",
      });
      setCategories(response.data);
      setTotalPages(response.meta.totalPages);
      setTotal(response.meta.total);
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal memuat kategori");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page, search]);

  // Open create modal
  const openCreateModal = () => {
    setModalMode("create");
    setFormData(initialFormData);
    setFormError("");
    setSelectedCategory(null);
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (category: Category) => {
    setModalMode("edit");
    setFormData({
      name: category.name,
      description: category.description || "",
      color: category.color,
      icon: category.icon || "",
    });
    setFormError("");
    setSelectedCategory(category);
    setShowModal(true);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim()) {
      setFormError("Nama kategori wajib diisi");
      return;
    }

    setIsSubmitting(true);
    try {
      if (modalMode === "create") {
        const data: CreateCategoryData = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          color: formData.color,
          icon: formData.icon.trim() || undefined,
        };
        await categoryService.create(data);
      } else if (selectedCategory) {
        const data: UpdateCategoryData = {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          color: formData.color,
          icon: formData.icon.trim() || null,
        };
        await categoryService.update(selectedCategory.id, data);
      }
      setShowModal(false);
      fetchCategories();
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Gagal menyimpan kategori");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);
    try {
      await categoryService.delete(categoryToDelete.id);
      setShowDeleteConfirm(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Gagal menghapus kategori";
      setDeleteError(errorMessage);
      setShowDeleteConfirm(false);
      setShowDeleteError(true);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kategori Produk</h1>
          <p className="text-slate-500 mt-1">
            Kelola kategori untuk mengorganisir produk Anda
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/20"
        >
          <Plus size={20} />
          <span>Tambah Kategori</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
        <div className="relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Cari kategori..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
        >
          <AlertCircle size={20} />
          <p>{error}</p>
        </motion.div>
      )}

      {/* Categories Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-blue-600" />
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <FolderOpen size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            {search ? "Kategori tidak ditemukan" : "Belum ada kategori"}
          </h3>
          <p className="text-slate-500 mb-4">
            {search
              ? "Coba kata kunci pencarian yang berbeda"
              : "Mulai dengan membuat kategori pertama Anda"}
          </p>
          {!search && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              <span>Tambah Kategori</span>
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow group"
                >
                  {/* Color indicator */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <FolderOpen size={24} style={{ color: category.color }} />
                  </div>

                  {/* Info */}
                  <h3 className="font-semibold text-slate-800 mb-1">
                    {category.name}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-3 min-h-[40px]">
                    {category.description || "Tidak ada deskripsi"}
                  </p>

                  {/* Product count */}
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                    <Package size={16} />
                    <span>{category._count?.products || 0} produk</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(category)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      <Edit2 size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        setCategoryToDelete(category);
                        setShowDeleteConfirm(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={14} />
                      <span>Hapus</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-slate-200 px-4 py-3">
              <p className="text-sm text-slate-600">
                Menampilkan {(page - 1) * 10 + 1} - {Math.min(page * 10, total)}{" "}
                dari {total} kategori
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm font-medium text-slate-700">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">
                  {modalMode === "create" ? "Tambah Kategori" : "Edit Kategori"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {formError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    <AlertCircle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Nama Kategori <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Contoh: Makanan"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Deskripsi
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Deskripsi singkat kategori..."
                    rows={3}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none"
                  />
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Warna
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-8 h-8 rounded-lg transition-all ${
                          formData.color === color
                            ? "ring-2 ring-offset-2 ring-slate-400 scale-110"
                            : "hover:scale-105"
                        }`}
                        style={{ backgroundColor: color }}
                      >
                        {formData.color === color && (
                          <Check size={16} className="mx-auto text-white" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <span>
                        {modalMode === "create" ? "Tambah" : "Simpan"}
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && categoryToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 size={32} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                Hapus Kategori?
              </h3>
              <p className="text-slate-500 mb-4">
                Apakah Anda yakin ingin menghapus kategori{" "}
                <span className="font-medium text-slate-700">
                  "{categoryToDelete.name}"
                </span>
                ? Tindakan ini tidak dapat dibatalkan.
              </p>
              {categoryToDelete._count &&
                categoryToDelete._count.products > 0 && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-700">
                      <AlertCircle size={14} className="inline mr-1" />
                      Kategori ini memiliki{" "}
                      <strong>{categoryToDelete._count.products} produk</strong>
                      . Hapus atau pindahkan produk terlebih dahulu.
                    </p>
                  </div>
                )}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Menghapus...</span>
                    </>
                  ) : (
                    <span>Hapus</span>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Error Alert Modal */}
      <AnimatePresence>
        {showDeleteError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteError(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertCircle size={32} className="text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                Tidak Dapat Menghapus Kategori
              </h3>
              <p className="text-slate-500 mb-6">{deleteError}</p>
              <p className="text-sm text-slate-400 mb-6">
                Pindahkan atau hapus produk dari kategori ini terlebih dahulu
                sebelum menghapus kategori.
              </p>
              <button
                onClick={() => setShowDeleteError(false)}
                className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Mengerti
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
