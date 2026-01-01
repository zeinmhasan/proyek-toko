import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Store,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string[]>
  >({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setValidationErrors({});
    setIsLoading(true);

    try {
      await login({ email, password });

      // Redirect to the page they tried to visit or dashboard
      const from = (location.state as any)?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error("Login error:", err); // Debug log

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
        setError("Login gagal. Periksa email dan password Anda.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 blur-[120px] animate-pulse" />
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

      {/* Login Container */}
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
                Selamat Datang!
              </h1>
              <p className="text-slate-500">Masuk ke akun TokoKu Anda</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 ${
                      validationErrors.email
                        ? "border-red-300 bg-red-50/50"
                        : "border-slate-200"
                    }`}
                    required
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-12 py-3.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 ${
                      validationErrors.password
                        ? "border-red-300 bg-red-50/50"
                        : "border-slate-200"
                    }`}
                    required
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

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  />
                  <span className="text-slate-600 group-hover:text-slate-800 transition-colors">
                    Ingat saya
                  </span>
                </label>
                <button
                  type="button"
                  className="font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  Lupa password?
                </button>
              </div>

              {/* Login Button */}
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
                  "Masuk"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-sm text-slate-400 font-medium">ATAU</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            {/* Social Login */}
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
                Masuk dengan Google
              </button>
            </div>
          </div>

          {/* Bottom Info */}
          <p className="text-center text-sm text-slate-500 mt-6">
            Dengan masuk, Anda menyetujui{" "}
            <button className="text-blue-600 hover:underline">
              Syarat & Ketentuan
            </button>{" "}
            dan{" "}
            <button className="text-blue-600 hover:underline">
              Kebijakan Privasi
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
