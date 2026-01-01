import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Package,
  TrendingUp,
  FileText,
  Store,
  ArrowRight,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  delay: number;
  onClick?: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  color,
  delay,
  onClick,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -10, scale: 1.02 }}
      onClick={onClick}
      className="group relative overflow-hidden rounded-[2rem] bg-white/80 p-8 shadow-xl shadow-slate-200/50 backdrop-blur-xl border border-white/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer"
    >
      <div
        className={cn(
          "absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-10 transition-all duration-500 group-hover:scale-150 group-hover:opacity-20 blur-2xl",
          color
        )}
      />

      <div className="relative z-10 flex flex-col h-full">
        <div
          className={cn(
            "mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg shadow-blue-500/20 ring-4 ring-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
            color
          )}
        >
          {icon}
        </div>

        <h3 className="mb-3 text-2xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>

        <p className="text-slate-600 leading-relaxed mb-8 flex-grow text-base">
          {description}
        </p>

        <div className="flex items-center text-sm font-bold text-slate-400 group-hover:text-blue-600 transition-colors uppercase tracking-wider">
          Buka Fitur{" "}
          <ArrowRight
            size={18}
            className="ml-2 group-hover:translate-x-2 transition-transform duration-300"
          />
        </div>
      </div>
    </motion.div>
  );
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "Kasir Pintar",
      description:
        "Sistem Point of Sale (POS) modern untuk transaksi cepat. Support scan barcode dan cetak struk.",
      icon: <ShoppingCart size={28} />,
      color: "bg-blue-600",
      onClick: () => navigate("/dashboard/pos"),
    },
    {
      title: "Manajemen Stok",
      description:
        "Pantau stok real-time, notifikasi stok menipis, dan manajemen supplier dalam satu dashboard.",
      icon: <Package size={28} />,
      color: "bg-emerald-500",
      onClick: () => navigate("/dashboard/inventory"),
    },
    {
      title: "Laporan Keuangan",
      description:
        "Analisis pemasukan, pengeluaran, dan laba rugi otomatis. Visualisasi data yang mudah dipahami.",
      icon: <TrendingUp size={28} />,
      color: "bg-violet-600",
      onClick: () => navigate("/dashboard/finance"),
    },
    {
      title: "Buku Hutang",
      description:
        "Catat hutang pelanggan dan piutang supplier. Pengingat jatuh tempo otomatis via WhatsApp.",
      icon: <FileText size={28} />,
      color: "bg-orange-500",
      onClick: () => navigate("/dashboard/debt"),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 blur-[120px] animate-pulse delay-1000" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white">
              <Store size={24} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">
              TokoKu
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              Masuk
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-32 px-6 relative">
        <div className="container mx-auto text-center max-w-5xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/80 backdrop-blur-sm text-blue-700 text-sm font-bold mb-10 border border-blue-100 shadow-sm hover:shadow-md transition-all cursor-default">
              <Zap size={18} className="fill-blue-600 text-blue-600" />
              <span>Platform Manajemen Toko #1 di Indonesia</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tight mb-8 leading-[1.1]">
              Kelola Toko Jadi <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 animate-gradient-x">
                Lebih Mudah & Efisien
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
              Satu aplikasi untuk semua kebutuhan tokomu. Dari kasir, stok
              barang, hingga laporan keuangan yang terintegrasi secara
              real-time.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-blue-600/30 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 group"
              >
                Coba Gratis Sekarang
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} delay={index * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-20 px-6 bg-white/50">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-16 overflow-hidden relative">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Semua Terhubung Dalam Satu Ekosistem
                </h2>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                  Tidak perlu pusing rekap data manual. Saat kasir input
                  penjualan, stok otomatis berkurang dan laporan keuangan
                  langsung terupdate.
                </p>

                <div className="space-y-4">
                  {[
                    "Sinkronisasi data real-time",
                    "Akses dari mana saja (Cloud)",
                    "Backup data otomatis aman",
                    "Support multi-cabang & multi-gudang",
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 text-slate-300"
                    >
                      <CheckCircle2 className="text-blue-500" size={20} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-6 border-b border-slate-700 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="text-slate-500 text-xs">Live Dashboard</div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-24 bg-slate-700/50 rounded-xl animate-pulse" />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-24 bg-slate-700/50 rounded-xl animate-pulse delay-75" />
                      <div className="h-24 bg-slate-700/50 rounded-xl animate-pulse delay-150" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                <Store size={20} />
              </div>
              <span className="text-lg font-bold text-slate-800">TokoKu</span>
            </div>
            <div className="text-slate-500 text-sm">
              &copy; 2025 TokoKu Management System. Dibuat dengan ❤️ untuk UMKM
              Indonesia.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
