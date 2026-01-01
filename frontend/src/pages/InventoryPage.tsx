import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Check,
  Minus,
  Archive,
  RefreshCw,
  Upload,
} from "lucide-react";
import { productService } from "../services/product.service";
import { categoryService } from "../services/category.service";
import { uploadService } from "../services/upload.service";
import {
  Product,
  CreateProductData,
  UpdateProductData,
  ProductStats,
  CategorySimple,
} from "../types/inventory";

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

interface ProductFormData {
  sku: string;
  name: string;
  description: string;
  price: string;
  costPrice: string;
  stock: string;
  minStock: string;
  unit: string;
  categoryId: string;
  isActive: boolean;
  image: string;
}

const initialFormData: ProductFormData = {
  sku: "",
  name: "",
  description: "",
  price: "",
  costPrice: "",
  stock: "0",
  minStock: "5",
  unit: "pcs",
  categoryId: "",
  isActive: true,
  image: "",
};

export default function InventoryPage() {
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategorySimple[]>([]);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out">("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [formError, setFormError] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stock modal
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [stockAction, setStockAction] = useState<"add" | "subtract" | "set">(
    "add"
  );
  const [stockQuantity, setStockQuantity] = useState("");
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [showDeleteError, setShowDeleteError] = useState(false);

  // Fetch data
  const fetchProducts = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [productsRes, statsRes] = await Promise.all([
        productService.getAll({
          page,
          limit: 10,
          search: search || undefined,
          categoryId: categoryFilter || undefined,
          isActive: undefined,
          lowStock: stockFilter === "low" ? true : undefined,
          sortBy: "name",
          sortOrder: "asc",
        }),
        productService.getStats(),
      ]);

      let filteredProducts = productsRes.data;
      if (stockFilter === "out") {
        filteredProducts = productsRes.data.filter((p) => p.stock === 0);
      }

      setProducts(filteredProducts);
      setTotalPages(productsRes.meta.totalPages);
      setTotal(productsRes.meta.total);
      setStats(statsRes);
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal memuat produk");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllSimple();
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search, categoryFilter, stockFilter]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Generate SKU
  const generateSKU = () => {
    const prefix = "PRD";
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}-${timestamp}${random}`;
  };

  // Open create modal
  const openCreateModal = () => {
    setModalMode("create");
    setFormData({
      ...initialFormData,
      sku: generateSKU(),
    });
    setFormError("");
    setFormErrors({});
    setSelectedProduct(null);
    setImageFile(null);
    setImagePreview("");
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (product: Product) => {
    setModalMode("edit");
    setFormData({
      sku: product.sku,
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      costPrice: product.costPrice?.toString() || "",
      stock: product.stock.toString(),
      minStock: product.minStock.toString(),
      unit: product.unit,
      categoryId: product.categoryId || "",
      isActive: product.isActive,
      image: product.image || "",
    });
    setFormError("");
    setFormErrors({});
    setSelectedProduct(product);
    setImageFile(null);
    setImagePreview(product.image || "");
    setShowModal(true);
  };

  // Handle image file selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setFormError("Ukuran file maksimal 5MB");
        return;
      }

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        setFormError("Hanya file gambar yang diizinkan (JPEG, PNG, GIF, WebP)");
        return;
      }

      setImageFile(file);
      setFormError("");

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData({ ...formData, image: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormErrors({});

    // Basic validation
    if (!formData.name.trim()) {
      setFormError("Nama produk wajib diisi");
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setFormError("Harga jual harus lebih dari 0");
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload image if a new file is selected
      let imageUrl = formData.image;
      if (imageFile) {
        setIsUploading(true);
        try {
          const uploadResult = await uploadService.uploadProductImage(
            imageFile
          );
          imageUrl = uploadResult.data.url;
        } catch (uploadErr: any) {
          setFormError(
            uploadErr.response?.data?.message || "Gagal upload gambar"
          );
          setIsSubmitting(false);
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }

      if (modalMode === "create") {
        const data: CreateProductData = {
          sku: formData.sku.trim(),
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          price: parseFloat(formData.price),
          costPrice: formData.costPrice
            ? parseFloat(formData.costPrice)
            : undefined,
          stock: parseInt(formData.stock) || 0,
          minStock: parseInt(formData.minStock) || 5,
          unit: formData.unit || "pcs",
          categoryId: formData.categoryId || undefined,
          isActive: formData.isActive,
          image: imageUrl || undefined,
        };
        await productService.create(data);
      } else if (selectedProduct) {
        const data: UpdateProductData = {
          sku: formData.sku.trim(),
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          price: parseFloat(formData.price),
          costPrice: formData.costPrice ? parseFloat(formData.costPrice) : null,
          stock: parseInt(formData.stock) || 0,
          minStock: parseInt(formData.minStock) || 5,
          unit: formData.unit || "pcs",
          categoryId: formData.categoryId || null,
          isActive: formData.isActive,
          image: imageUrl || null,
        };
        await productService.update(selectedProduct.id, data);
      }
      setShowModal(false);
      fetchProducts();
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      } else {
        setFormError(err.response?.data?.message || "Gagal menyimpan produk");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle stock update
  const handleStockUpdate = async () => {
    if (!stockProduct || !stockQuantity) return;

    setIsUpdatingStock(true);
    try {
      await productService.updateStock(stockProduct.id, {
        quantity: parseInt(stockQuantity),
        type: stockAction,
      });
      setShowStockModal(false);
      setStockProduct(null);
      setStockQuantity("");
      fetchProducts();
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Gagal update stok");
    } finally {
      setIsUpdatingStock(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      await productService.delete(productToDelete.id);
      setShowDeleteConfirm(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Gagal menghapus produk";
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
          <h1 className="text-2xl font-bold text-slate-800">
            Inventori Produk
          </h1>
          <p className="text-slate-500 mt-1">
            Kelola stok dan informasi produk Anda
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/20"
        >
          <Plus size={20} />
          <span>Tambah Produk</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {stats.totalProducts}
                </p>
                <p className="text-sm text-slate-500">Total Produk</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {stats.activeProducts}
                </p>
                <p className="text-sm text-slate-500">Produk Aktif</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <AlertTriangle size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {stats.lowStock}
                </p>
                <p className="text-sm text-slate-500">Stok Menipis</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Archive size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {stats.outOfStock}
                </p>
                <p className="text-sm text-slate-500">Stok Habis</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all min-w-[150px]"
          >
            <option value="">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => {
              setStockFilter(e.target.value as "all" | "low" | "out");
              setPage(1);
            }}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all min-w-[150px]"
          >
            <option value="all">Semua Stok</option>
            <option value="low">Stok Menipis</option>
            <option value="out">Stok Habis</option>
          </select>
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

      {/* Products Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-blue-600" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <Package size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            {search || categoryFilter || stockFilter !== "all"
              ? "Produk tidak ditemukan"
              : "Belum ada produk"}
          </h3>
          <p className="text-slate-500 mb-4">
            {search || categoryFilter || stockFilter !== "all"
              ? "Coba ubah filter pencarian"
              : "Mulai dengan menambahkan produk pertama Anda"}
          </p>
          {!search && !categoryFilter && stockFilter === "all" && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              <span>Tambah Produk</span>
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">
                      Produk
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">
                      SKU
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">
                      Kategori
                    </th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-slate-600">
                      Harga Jual
                    </th>
                    <th className="text-center px-4 py-3 text-sm font-semibold text-slate-600">
                      Stok
                    </th>
                    <th className="text-center px-4 py-3 text-sm font-semibold text-slate-600">
                      Status
                    </th>
                    <th className="text-center px-4 py-3 text-sm font-semibold text-slate-600">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
                            style={{
                              backgroundColor:
                                product.category?.color || "#3B82F6",
                            }}
                          >
                            {product.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">
                              {product.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {product.unit}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono text-slate-600">
                          {product.sku}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {product.category ? (
                          <span
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: `${product.category.color}20`,
                              color: product.category.color,
                            }}
                          >
                            {product.category.name}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-slate-800">
                          {formatCurrency(product.price)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span
                            className={`font-semibold ${
                              product.stock === 0
                                ? "text-red-600"
                                : product.stock <= product.minStock
                                ? "text-amber-600"
                                : "text-slate-800"
                            }`}
                          >
                            {product.stock}
                          </span>
                          <button
                            onClick={() => {
                              setStockProduct(product);
                              setStockAction("add");
                              setStockQuantity("");
                              setShowStockModal(true);
                            }}
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Update stok"
                          >
                            <RefreshCw size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {product.stock === 0 ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            Habis
                          </span>
                        ) : product.stock <= product.minStock ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            Menipis
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Tersedia
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setProductToDelete(product);
                              setShowDeleteConfirm(true);
                            }}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-slate-200 px-4 py-3">
              <p className="text-sm text-slate-600">
                Menampilkan {(page - 1) * 10 + 1} - {Math.min(page * 10, total)}{" "}
                dari {total} produk
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

      {/* Create/Edit Product Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">
                  {modalMode === "create" ? "Tambah Produk" : "Edit Produk"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              {/* Modal Body */}
              <form
                onSubmit={handleSubmit}
                className="p-6 space-y-4 max-h-[70vh] overflow-y-auto"
              >
                {formError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    <AlertCircle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                {Object.keys(formErrors).length > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    <p className="font-medium mb-1">Validasi Error:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      {Object.entries(formErrors).map(([field, errors]) => (
                        <li key={field}>
                          <span className="capitalize">{field}</span>:{" "}
                          {errors.join(", ")}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {/* SKU */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      SKU <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) =>
                        setFormData({ ...formData, sku: e.target.value })
                      }
                      placeholder="PRD-001"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-mono"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Kategori
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) =>
                        setFormData({ ...formData, categoryId: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    >
                      <option value="">Pilih Kategori</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Nama Produk <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Contoh: Indomie Goreng"
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
                    placeholder="Deskripsi singkat produk..."
                    rows={2}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Gambar Produk
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleImageSelect}
                    className="hidden"
                  />

                  {/* Upload Area */}
                  {!imagePreview ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all"
                    >
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">
                        Klik untuk upload gambar
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        JPEG, PNG, GIF, WebP (Max 5MB)
                      </p>
                    </div>
                  ) : (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-24 h-24 object-cover rounded-lg border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-2 -right-2 bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600 transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  )}

                  {isUploading && (
                    <div className="flex items-center gap-2 mt-2 text-blue-600 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mengupload gambar...</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Harga Jual <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="0"
                      min="0"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    />
                  </div>

                  {/* Cost Price */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Harga Modal
                    </label>
                    <input
                      type="number"
                      value={formData.costPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, costPrice: e.target.value })
                      }
                      placeholder="0"
                      min="0"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {/* Stock */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Stok Awal
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({ ...formData, stock: e.target.value })
                      }
                      placeholder="0"
                      min="0"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    />
                  </div>

                  {/* Min Stock */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Stok Minimum
                    </label>
                    <input
                      type="number"
                      value={formData.minStock}
                      onChange={(e) =>
                        setFormData({ ...formData, minStock: e.target.value })
                      }
                      placeholder="5"
                      min="0"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    />
                  </div>

                  {/* Unit */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Satuan
                    </label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) =>
                        setFormData({ ...formData, unit: e.target.value })
                      }
                      placeholder="pcs"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    />
                  </div>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, isActive: !formData.isActive })
                    }
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      formData.isActive ? "bg-blue-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                        formData.isActive ? "left-7" : "left-1"
                      }`}
                    />
                  </button>
                  <span className="text-sm text-slate-700">Produk Aktif</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
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

      {/* Stock Update Modal */}
      <AnimatePresence>
        {showStockModal && stockProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowStockModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Update Stok: {stockProduct.name}
              </h3>

              <p className="text-sm text-slate-500 mb-4">
                Stok saat ini:{" "}
                <span className="font-semibold text-slate-800">
                  {stockProduct.stock}
                </span>
              </p>

              {/* Action Tabs */}
              <div className="flex gap-2 mb-4">
                {[
                  { value: "add", label: "Tambah", icon: Plus },
                  { value: "subtract", label: "Kurang", icon: Minus },
                  { value: "set", label: "Set", icon: Check },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setStockAction(value as "add" | "subtract" | "set")
                    }
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      stockAction === value
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* Quantity Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Jumlah
                </label>
                <input
                  type="number"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-center text-lg font-semibold"
                />
              </div>

              {/* Preview */}
              {stockQuantity && (
                <p className="text-sm text-slate-600 mb-4 text-center">
                  Stok akan menjadi:{" "}
                  <span className="font-semibold text-blue-600">
                    {stockAction === "add"
                      ? stockProduct.stock + parseInt(stockQuantity || "0")
                      : stockAction === "subtract"
                      ? stockProduct.stock - parseInt(stockQuantity || "0")
                      : parseInt(stockQuantity || "0")}
                  </span>
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={handleStockUpdate}
                  disabled={isUpdatingStock || !stockQuantity}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUpdatingStock ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Update Stok</span>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && productToDelete && (
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
                Hapus Produk?
              </h3>
              <p className="text-slate-500 mb-6">
                Apakah Anda yakin ingin menghapus produk{" "}
                <span className="font-medium text-slate-700">
                  "{productToDelete.name}"
                </span>
                ? Tindakan ini tidak dapat dibatalkan.
              </p>
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
                Tidak Dapat Menghapus Produk
              </h3>
              <p className="text-slate-500 mb-6">{deleteError}</p>
              <p className="text-sm text-slate-400 mb-6">
                Anda dapat menonaktifkan produk sebagai alternatif jika tidak
                ingin produk ini muncul di kasir.
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
