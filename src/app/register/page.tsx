"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Loader2,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Building2,
  CheckCircle,
  ArrowRight,
  FileClock,
} from "lucide-react";

const PARTICLES = [
  { x: 5, y: 12, w: 3, h: 3, delay: 0.0, dur: 5.2 },
  { x: 15, y: 78, w: 4, h: 2, delay: 1.3, dur: 4.1 },
  { x: 22, y: 35, w: 2, h: 5, delay: 0.7, dur: 6.3 },
  { x: 31, y: 62, w: 5, h: 3, delay: 2.1, dur: 3.8 },
  { x: 40, y: 8, w: 3, h: 4, delay: 0.4, dur: 5.6 },
  { x: 48, y: 91, w: 4, h: 2, delay: 1.8, dur: 4.5 },
  { x: 55, y: 45, w: 2, h: 3, delay: 2.6, dur: 6.1 },
  { x: 63, y: 22, w: 5, h: 5, delay: 0.9, dur: 3.4 },
  { x: 72, y: 68, w: 3, h: 2, delay: 1.5, dur: 5.9 },
  { x: 80, y: 15, w: 4, h: 4, delay: 0.2, dur: 4.7 },
  { x: 88, y: 52, w: 2, h: 3, delay: 2.3, dur: 6.5 },
  { x: 95, y: 85, w: 5, h: 2, delay: 0.6, dur: 3.2 },
  { x: 10, y: 48, w: 3, h: 5, delay: 1.1, dur: 5.4 },
  { x: 27, y: 93, w: 4, h: 3, delay: 2.8, dur: 4.3 },
  { x: 37, y: 30, w: 2, h: 2, delay: 0.3, dur: 6.8 },
  { x: 52, y: 72, w: 5, h: 4, delay: 1.7, dur: 3.6 },
  { x: 67, y: 5, w: 3, h: 3, delay: 2.4, dur: 5.1 },
  { x: 75, y: 40, w: 4, h: 5, delay: 0.8, dur: 4.9 },
  { x: 83, y: 88, w: 2, h: 2, delay: 1.4, dur: 6.2 },
  { x: 92, y: 58, w: 5, h: 3, delay: 2.0, dur: 3.9 },
];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [instansi, setInstansi] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      return;
    }
    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, instansi }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Gagal mendaftar. Coba lagi.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/10 animate-float"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.w}px`, height: `${p.h}px`, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` }}
          />
        ))}
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative px-8 pt-8 pb-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center overflow-hidden">
                <Image src="/pu-logo-png_seeklogo-355609.png" alt="Logo" width={36} height={36} className="object-contain" />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-white leading-tight">Arsip Bapekom</h1>
                <p className="text-xs text-blue-300/80">Sistem Manajemen Arsip Digital</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="p-2 bg-indigo-500/20 rounded-xl">
                <FileClock size={20} className="text-indigo-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Daftar Sebagai Peminjam</p>
                <p className="text-xs text-white/50 mt-0.5">Buat akun untuk meminjam arsip</p>
              </div>
            </div>
          </div>

          {/* Form or Success */}
          <div className="px-8 pb-8">
            {success ? (
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="p-4 bg-emerald-500/20 rounded-2xl">
                  <CheckCircle size={40} className="text-emerald-400" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-white">Pendaftaran Berhasil!</p>
                  <p className="text-sm text-white/60 mt-1">
                    Akun Anda telah berhasil dibuat. Silakan login untuk mulai meminjam arsip.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="mt-2 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl text-sm font-semibold hover:from-indigo-500 hover:to-blue-500 transition-all shadow-lg"
                >
                  Masuk Sekarang <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
                    Nama Lengkap <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      id="register-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={loading}
                      placeholder="Masukkan nama lengkap Anda"
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 transition-all disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      id="register-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      placeholder="nama@contoh.com"
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 transition-all disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Instansi */}
                <div>
                  <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
                    Instansi / Organisasi <span className="text-white/30">(opsional)</span>
                  </label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      id="register-instansi"
                      type="text"
                      value={instansi}
                      onChange={(e) => setInstansi(e.target.value)}
                      disabled={loading}
                      placeholder="Nama instansi atau organisasi Anda"
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 transition-all disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      placeholder="Minimal 8 karakter"
                      className="w-full pl-10 pr-11 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 transition-all disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {/* Password strength bar */}
                  {password && (
                    <div className="mt-2 flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            password.length >= i * 3
                              ? password.length >= 12 ? "bg-emerald-400" : password.length >= 8 ? "bg-amber-400" : "bg-red-400"
                              : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
                    Konfirmasi Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      id="register-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                      placeholder="Ulangi password Anda"
                      className={`w-full pl-10 pr-11 py-3 bg-white/10 border rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 transition-all disabled:opacity-60 ${
                        confirmPassword && confirmPassword !== password
                          ? "border-red-400/60 focus:ring-red-500/30"
                          : "border-white/20 focus:ring-indigo-500/50 focus:border-indigo-400/50"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== password && (
                    <p className="text-xs text-red-400 mt-1">Password tidak cocok.</p>
                  )}
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-red-500/20 border border-red-400/30 rounded-xl text-red-300 text-sm">
                    <span className="shrink-0">⚠️</span>
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  id="register-submit"
                  type="submit"
                  disabled={loading || !name || !email || !password || !confirmPassword}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl text-sm font-semibold hover:from-indigo-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-lg shadow-indigo-500/30 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none mt-2"
                >
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin" /> Mendaftar...</>
                  ) : (
                    <><FileClock size={18} /> Daftar Sekarang</>
                  )}
                </button>

                {/* Login link */}
                <p className="text-center text-sm text-white/50 pt-2">
                  Sudah punya akun?{" "}
                  <Link href="/login" className="text-indigo-300 hover:text-indigo-200 font-semibold transition-colors">
                    Masuk di sini
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-white/30 mt-4">
          Dengan mendaftar, Anda menyetujui syarat penggunaan layanan arsip digital ini.
        </p>
      </div>
    </div>
  );
}
