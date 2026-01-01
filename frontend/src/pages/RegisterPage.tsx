import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Store,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  User,
  Phone,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string[]>
  >({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreed: false,
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setValidationErrors({});

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }

    if (!formData.agreed) {
      setError("Anda harus menyetujui syarat dan ketentuan");
      return;
    }

    setIsLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
      });

      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      console.error("Register error:", err); // Debug log

      // Handle validation errors from backend
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        // Handle specific error message from backend
        setError(err.response.data.message);
      } else if (err.message) {
        // Handle axios or network errors
        setError(err.message);
      } else {
        // Fallback error message
        setError("Registrasi gagal. Silakan coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[120px] animate-pulse delay-1000" />
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm text-slate-700 rounded-full hover:bg-white hover:shadow-lg transition-all duration-300 group"
      >
        <ArrowLeft
          size={18}
          className="group-hover:-translate-x-1 transition-transform"
        />
        <span className="font-medium">Kembali</span>
      </button>

      {/* Register Container */}
      <div className="min-h-screen flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 border border-white/50 p-8 md:p-10">
            {/* Logo & Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl text-white shadow-lg shadow-blue-600/30 mb-4">
                <Store size={32} />
              </div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                Daftar Akun Baru
              </h1>
              <p className="text-slate-500">
                Mulai kelola toko Anda dengan TokoKu
              </p>
            </div>

            {/* Register Form */}
            <form onSubmit={handleRegister} className="space-y-5">
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
                >
                  <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </motion.div>
              )}

              {/* Validation Errors */}
              {Object.keys(validationErrors).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-semibold">
                      Terjadi kesalahan validasi:
                    </p>
                  </div>
                  <ul className="ml-8 space-y-1">
                    {Object.entries(validationErrors).map(([field, errors]) => (
                      <li key={field} className="text-sm">
                        <span className="font-medium capitalize">{field}:</span>{" "}
                        {errors.join(", ")}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Name Input */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Nama Lengkap
                </label>
                <div className="relative group">
                  <User
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                  />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Masukkan nama lengkap"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Email
                </label>
                <div className="relative group">
                  <Mail
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                  />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="nama@email.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              {/* Phone Input */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Nomor Telepon{" "}
                  <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <div className="relative group">
                  <Phone
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                  />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="081234567890"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <Lock
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Minimal 8 karakter"
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Konfirmasi Password
                </label>
                <div className="relative group">
                  <Lock
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                  />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Ulangi password"
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms Agreement */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.agreed}
                    onChange={(e) =>
                      setFormData({ ...formData, agreed: e.target.checked })
                    }
                    className="w-5 h-5 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                    required
                  />
                  <span className="text-sm text-slate-600 leading-relaxed group-hover:text-slate-800 transition-colors">
                    Saya setuju dengan{" "}
                    <button
                      type="button"
                      className="font-bold text-blue-600 hover:underline"
                    >
                      Syarat & Ketentuan
                    </button>{" "}
                    dan{" "}
                    <button
                      type="button"
                      className="font-bold text-blue-600 hover:underline"
                    >
                      Kebijakan Privasi
                    </button>
                  </span>
                </label>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Memproses...
                  </span>
                ) : (
                  "Daftar Sekarang"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-sm text-slate-400 font-medium">ATAU</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            {/* Social Register */}
            <div className="space-y-3">
              <button
                type="button"
                className="w-full py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 hover:border-slate-300 hover:shadow-md transition-all duration-300 flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Daftar dengan Google
              </button>
            </div>

            {/* Login Link */}
            <p className="text-center text-sm text-slate-600 mt-6">
              Sudah punya akun?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                Masuk Sekarang
              </button>
            </p>
          </div>

          {/* Bottom Info */}
          <p className="text-center text-sm text-slate-500 mt-6">
            🎉 Gratis 30 hari masa percobaan, tanpa kartu kredit
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
