import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  X,
  CheckCircle,
  Printer,
  AlertCircle,
  Package,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { productService } from "../services/product.service";
import { categoryService } from "../services/category.service";
import { receiptService } from "../services/receipt.service";
import { transactionService } from "../services/transaction.service";
import { Product, Category } from "../types/inventory";
import { CartItem, PaymentMethod, Transaction } from "../types/transaction";

const POSPage: React.FC = () => {
  // Products & Categories
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Category scroll
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = 0; // Add discount logic if needed
  const tax = 0; // Add tax logic if needed
  const total = subtotal - discount + tax;

  // Payment
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod] = useState<PaymentMethod>("CASH");
  const [paidAmount, setPaidAmount] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  // Receipt
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(
    null
  );

  // Check scroll buttons visibility
  const checkScrollButtons = () => {
    const container = categoryScrollRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 1
      );
    }
  };

  // Scroll categories
  const scrollCategories = (direction: "left" | "right") => {
    const container = categoryScrollRef.current;
    if (container) {
      const scrollAmount = 200;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Update scroll buttons on categories change
  useEffect(() => {
    checkScrollButtons();
    const container = categoryScrollRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollButtons);
      window.addEventListener("resize", checkScrollButtons);
      return () => {
        container.removeEventListener("scroll", checkScrollButtons);
        window.removeEventListener("resize", checkScrollButtons);
      };
    }
  }, [categories]);

  // Load products and categories
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        productService.getAll({ limit: 100, isActive: true }),
        categoryService.getAll({ limit: 100 }),
      ]);
      setProducts(productsData.data);
      setCategories(categoriesData.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal memuat data produk");
    } finally {
      setLoading(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchCategory =
      !activeCategory || product.categoryId === activeCategory;
    const matchSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch && product.stock > 0;
  });

  // Cart functions
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        // Check stock
        if (existing.quantity >= product.stock) {
          return prev;
        }
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          price: Number(product.price),
          quantity: 1,
          stock: product.stock,
          image: product.image ?? undefined,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: Math.max(
                  1,
                  Math.min(item.quantity + delta, item.stock)
                ),
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => setCart([]);

  // Payment logic
  const handleOpenPayment = () => setShowPaymentModal(true);
  const handlePayment = async () => {
    setProcessing(true);
    try {
      // Prepare transaction payload
      const payload = {
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        discount,
        tax,
        paidAmount: paidAmount ? Number(paidAmount) : total,
        paymentMethod,
        notes,
        customerName,
      };

      // Call backend API
      const transaction = await transactionService.create(payload);

      setShowPaymentModal(false);
      setShowReceiptModal(true);
      setLastTransaction(transaction);

      // Clear cart and refresh products to update stock
      clearCart();
      await loadData();
      setProcessing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal memproses pembayaran");
      setProcessing(false);
    }
  };

  const quickAmounts = [50000, 100000, 150000, 200000];

  if (loading) {
    return (
      <div className="h-[calc(100vh-2rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Memuat produk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col md:flex-row gap-4 md:gap-6">
      {/* Left Side - Product List */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Header & Search */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
          {/* Search */}
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Cari produk..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Filter with Scroll */}
          <div className="relative flex items-center gap-2">
            {/* Left Scroll Button */}
            {canScrollLeft && (
              <button
                onClick={() => scrollCategories("left")}
                className="absolute left-0 z-10 bg-gradient-to-r from-white via-white to-transparent pr-4 pl-1 py-1"
              >
                <div className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
                  <ChevronLeft size={16} className="text-slate-600" />
                </div>
              </button>
            )}

            {/* Categories Container */}
            <div
              ref={categoryScrollRef}
              className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                paddingLeft: canScrollLeft ? "32px" : "0",
                paddingRight: canScrollRight ? "32px" : "0",
              }}
            >
              <button
                onClick={() => setActiveCategory("")}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                  !activeCategory
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Semua
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                    activeCategory === cat.id
                      ? "text-white shadow-lg"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                  style={
                    activeCategory === cat.id
                      ? {
                          backgroundColor: cat.color || "#2563eb",
                          boxShadow: `0 10px 15px -3px ${
                            cat.color || "#2563eb"
                          }40`,
                        }
                      : {}
                  }
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Right Scroll Button */}
            {canScrollRight && (
              <button
                onClick={() => scrollCategories("right")}
                className="absolute right-0 z-10 bg-gradient-to-l from-white via-white to-transparent pl-4 pr-1 py-1"
              >
                <div className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
                  <ChevronRight size={16} className="text-slate-600" />
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
            <button onClick={() => setError("")} className="ml-auto">
              <X className="w-4 h-4 text-red-600" />
            </button>
          </div>
        )}

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-2 pb-4">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Package className="w-16 h-16 mb-4 opacity-50" />
              <p className="font-medium">Tidak ada produk ditemukan</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => {
                const inCart = cart.find((c) => c.productId === product.id);
                return (
                  <motion.div
                    key={product.id}
                    whileHover={{ y: -4 }}
                    onClick={() => addToCart(product)}
                    className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 group relative overflow-hidden"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-slate-100 relative">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <Package className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <button className="absolute bottom-2 right-2 bg-white text-blue-600 p-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <Plus size={16} strokeWidth={3} />
                      </button>
                      {inCart && (
                        <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {inCart.quantity}
                        </div>
                      )}
                    </div>
                    <div className="relative group">
                      <h3
                        className="font-bold text-slate-800 mb-1 truncate text-sm cursor-help"
                        title={product.name}
                      >
                        {product.name}
                      </h3>
                      {product.name.length > 22 && (
                        <div className="absolute left-0 top-full z-20 bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-normal w-max max-w-xs pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {product.name}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-blue-600 font-bold text-sm">
                        Rp {Number(product.price).toLocaleString("id-ID")}
                      </p>
                      <span className="text-xs text-gray-400">
                        Stok: {product.stock}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {/* Right Side - Cart, Summary, Modals */}
      <div className="w-full md:w-[400px] flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100 min-h-0">
        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-8">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag size={32} className="opacity-20" />
              </div>
              <p className="font-medium">Keranjang masih kosong</p>
              <p className="text-sm mt-1 opacity-70">
                Pilih produk di sebelah kiri untuk menambahkan
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <motion.div
                key={item.productId}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-blue-200 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 text-sm mb-1 truncate">
                    {item.productName}
                  </h4>
                  <p className="text-blue-600 font-bold text-sm">
                    Rp {item.price.toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm border border-slate-100">
                    <button
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="p-1 hover:bg-slate-50 rounded-md transition-colors text-slate-600"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-bold w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="p-1 hover:bg-slate-50 rounded-md transition-colors text-slate-600"
                      disabled={item.quantity >= item.stock}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Summary & Checkout */}
        <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)] z-10">
          <div className="space-y-3 text-sm mb-6">
            <div className="flex justify-between text-slate-500">
              <span>
                Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} item)
              </span>
              <span className="font-medium text-slate-700">
                Rp {subtotal.toLocaleString("id-ID")}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Diskon</span>
                <span>-Rp {discount.toLocaleString("id-ID")}</span>
              </div>
            )}
            {tax > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>Pajak</span>
                <span>Rp {tax.toLocaleString("id-ID")}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-slate-800 pt-4 border-t border-dashed border-slate-200">
              <span>Total</span>
              <span className="text-blue-600">
                Rp {total.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <button
            onClick={handleOpenPayment}
            disabled={cart.length === 0}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100 flex items-center justify-center gap-2"
          >
            Bayar Sekarang
            <ArrowRight size={20} />
          </button>
        </div>

        {/* Payment Modal */}
        <AnimatePresence>
          {showPaymentModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              >
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">
                      Pembayaran
                    </h2>
                    <button
                      onClick={() => setShowPaymentModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  {/* ...existing code for payment modal... */}

                  {/* Paid Amount */}
                  {paymentMethod === "CASH" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jumlah Dibayar
                      </label>
                      <input
                        type="number"
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(e.target.value)}
                        className="w-full px-4 py-3 text-xl font-bold text-center border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                      <div className="flex gap-2 mt-2">
                        {quickAmounts.map((amount) => (
                          <button
                            key={amount}
                            onClick={() => setPaidAmount(amount.toString())}
                            className="flex-1 py-2 text-sm font-medium bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            {(amount / 1000).toFixed(0)}K
                          </button>
                        ))}
                      </div>
                      {parseFloat(paidAmount) > total && (
                        <p className="text-green-600 text-sm mt-2 text-center">
                          Kembalian: Rp{" "}
                          {(parseFloat(paidAmount) - total).toLocaleString(
                            "id-ID"
                          )}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Customer Name (Optional) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Pelanggan (Opsional)
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nama pelanggan"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catatan (Opsional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={2}
                      placeholder="Catatan transaksi"
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="text-red-800 text-sm">{error}</span>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    onClick={handlePayment}
                    disabled={
                      processing ||
                      (paymentMethod === "CASH" &&
                        parseFloat(paidAmount) < total)
                    }
                    className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Memproses...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={20} />
                        Konfirmasi Pembayaran
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Receipt Modal */}
        <AnimatePresence>
          {showReceiptModal && lastTransaction && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              >
                <div className="p-6 text-center border-b border-gray-100 bg-green-50">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-green-800">
                    Transaksi Berhasil!
                  </h2>
                  <p className="text-green-600 mt-1">
                    {lastTransaction.invoiceNumber}
                  </p>
                </div>

                <div className="p-6 space-y-4">
                  {/* Items */}
                  <div className="space-y-2">
                    {lastTransaction.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-gray-600">
                          {item.product.name} x{item.quantity}
                        </span>
                        <span className="font-medium">
                          Rp {Number(item.subtotal).toLocaleString("id-ID")}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-dashed pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span>
                        Rp{" "}
                        {Number(lastTransaction.subtotal).toLocaleString(
                          "id-ID"
                        )}
                      </span>
                    </div>
                    {Number(lastTransaction.discount) > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Diskon</span>
                        <span>
                          -Rp{" "}
                          {Number(lastTransaction.discount).toLocaleString(
                            "id-ID"
                          )}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-blue-600">
                        Rp{" "}
                        {Number(lastTransaction.total).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Dibayar</span>
                      <span>
                        Rp{" "}
                        {Number(lastTransaction.paidAmount).toLocaleString(
                          "id-ID"
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Kembalian</span>
                      <span>
                        Rp{" "}
                        {Number(lastTransaction.changeAmount).toLocaleString(
                          "id-ID"
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={async () => {
                        if (!lastTransaction) return;
                        try {
                          const blob = await receiptService.downloadReceipt(
                            lastTransaction.id
                          );
                          const url = window.URL.createObjectURL(
                            new Blob([blob], { type: "application/pdf" })
                          );
                          const link = document.createElement("a");
                          link.href = url;
                          link.setAttribute(
                            "download",
                            `struk-${lastTransaction.invoiceNumber}.pdf`
                          );
                          document.body.appendChild(link);
                          link.click();
                          link.parentNode?.removeChild(link);
                          window.URL.revokeObjectURL(url);
                        } catch (e) {
                          alert("Gagal mengunduh struk PDF");
                        }
                      }}
                      className="flex-1 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Printer size={18} />
                      Download PDF
                    </button>
                    <button
                      onClick={() => {
                        setShowReceiptModal(false);
                        setLastTransaction(null);
                      }}
                      className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                      Transaksi Baru
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default POSPage;
