import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Phone, Lock, Save, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/auth.service";

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordValidationErrors, setPasswordValidationErrors] = useState<Record<string, string[]>>({});

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setIsProfileLoading(true);

    try {
      const updated = await authService.updateProfile(profileData);
      updateUser(updated);
      setProfileSuccess("Profil berhasil diperbarui!");
      setTimeout(() => setProfileSuccess(""), 3000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Gagal memperbarui profil";
      setProfileError(errorMessage);
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    setPasswordValidationErrors({});

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Password baru dan konfirmasi password tidak cocok");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError("Password baru minimal 8 karakter");
      return;
    }

    setIsPasswordLoading(true);

    try {
      await authService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      setPasswordSuccess("Password berhasil diubah!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setPasswordValidationErrors(err.response.data.errors);
      } else {
        const errorMessage = err.response?.data?.message || "Gagal mengubah password";
        setPasswordError(errorMessage);
      }
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Pengaturan Profil</h1>
          <p className="text-slate-500">Kelola informasi akun dan keamanan Anda</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-6 py-3 font-medium transition-all duration-300 border-b-2 ${
              activeTab === "profile"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Profil Saya
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`px-6 py-3 font-medium transition-all duration-300 border-b-2 ${
              activeTab === "password"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Ubah Password
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 p-6 md:p-8">
          <AnimatePresence mode="wait">
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-xl font-bold text-slate-800 mb-6">Informasi Profil</h2>

                {/* Success Message */}
                {profileSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 mb-6 bg-green-50 border border-green-200 rounded-xl text-green-700"
                  >
                    <CheckCircle size={20} />
                    <p className="text-sm font-medium">{profileSuccess}</p>
                  </motion.div>
                )}

                {/* Error Message */}
                {profileError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-xl text-red-700"
                  >
                    <AlertCircle size={20} />
                    <p className="text-sm">{profileError}</p>
                  </motion.div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  {/* Email (Read-only) */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={user?.email}
                        disabled
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Email tidak dapat diubah</p>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Nomor Telepon
                    </label>
                    <div className="relative">
                      <Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
                        placeholder="081234567890"
                      />
                    </div>
                  </div>

                  {/* Role (Read-only) */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Role
                    </label>
                    <div className="px-4 py-3.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-700">
                      {user?.role === "ADMIN" ? "Administrator" : user?.role === "OWNER" ? "Owner" : "Kasir"}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isProfileLoading}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                  >
                    {isProfileLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        Simpan Perubahan
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {activeTab === "password" && (
              <motion.div
                key="password"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-xl font-bold text-slate-800 mb-6">Ubah Password</h2>

                {/* Success Message */}
                {passwordSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 mb-6 bg-green-50 border border-green-200 rounded-xl text-green-700"
                  >
                    <CheckCircle size={20} />
                    <p className="text-sm font-medium">{passwordSuccess}</p>
                  </motion.div>
                )}

                {/* Error Message */}
                {passwordError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-xl text-red-700"
                  >
                    <AlertCircle size={20} />
                    <p className="text-sm">{passwordError}</p>
                  </motion.div>
                )}

                {/* Validation Errors */}
                {Object.keys(passwordValidationErrors).length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 mb-6 bg-red-50 border border-red-200 rounded-xl text-red-700"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-semibold">Terjadi kesalahan validasi:</p>
                    </div>
                    <ul className="ml-8 space-y-1">
                      {Object.entries(passwordValidationErrors).map(([field, errors]) => (
                        <li key={field} className="text-sm">
                          <span className="font-medium capitalize">{field}:</span> {errors.join(", ")}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-6">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Password Saat Ini
                    </label>
                    <div className="relative">
                      <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
                        placeholder="Masukkan password saat ini"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Password Baru
                    </label>
                    <div className="relative">
                      <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
                        placeholder="Masukkan password baru"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Minimal 8 karakter, harus mengandung huruf besar, huruf kecil, dan angka
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Konfirmasi Password Baru
                    </label>
                    <div className="relative">
                      <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
                        placeholder="Konfirmasi password baru"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isPasswordLoading}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                  >
                    {isPasswordLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Memproses...
                      </>
                    ) : (
                      <>
                        <Lock size={20} />
                        Ubah Password
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
