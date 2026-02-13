"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Archive, Loader2, Eye, EyeOff, Shield, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Email atau password salah");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "0.7s" }} />

      <div className="relative z-10 w-full max-w-md px-4 animate-fade-in-up">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-5 shadow-2xl shadow-blue-500/30 animate-pulse-glow">
            <Archive className="text-white" size={36} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Arsip Bapekom
          </h1>
          <p className="text-blue-200/80 mt-2 text-sm">
            Sistem Pengarsipan Digital Terpadu
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-dark rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Shield size={20} className="text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Masuk ke Akun</h2>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm flex items-center gap-2 animate-fade-in-up">
              <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="animate-fade-in-up stagger-1">
              <label className="block text-sm font-medium text-blue-200/80 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400/50"
                  size={18}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300/30 focus:outline-none focus:border-blue-400/50 focus:bg-white/10 transition-all text-sm"
                  placeholder="nama@bapekom.go.id"
                />
              </div>
            </div>

            <div className="animate-fade-in-up stagger-2">
              <label className="block text-sm font-medium text-blue-200/80 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400/50"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300/30 focus:outline-none focus:border-blue-400/50 focus:bg-white/10 transition-all text-sm"
                  placeholder="Masukkan password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-400/50 hover:text-blue-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="animate-fade-in-up stagger-3 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  "Masuk"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 animate-fade-in-up stagger-4">
          <p className="text-blue-300/40 text-xs">
            &copy; 2026 Bapekom &mdash; Balai Pengawas Keamanan
          </p>
          <p className="text-blue-300/25 text-xs mt-1">
            Sistem Informasi Pengarsipan v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
