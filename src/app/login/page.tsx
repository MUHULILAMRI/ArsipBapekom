"use client";

import { useState, useEffect, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff, Shield, Lock, Mail } from "lucide-react";
import Image from "next/image";

// Pre-computed particle positions to avoid hydration mismatch from Math.random()
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

export default function LoginPage() {
  const router = useRouter();
  const [showIntro, setShowIntro] = useState(true);
  const [introFading, setIntroFading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  // Auto-dismiss intro after animation completes
  useEffect(() => {
    const timer = setTimeout(() => {
      endIntro();
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  const endIntro = () => {
    if (introFading) return;
    setIntroFading(true);
    setTimeout(() => {
      setShowIntro(false);
    }, 800);
  };

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
      setError("Invalid email or password");
      setLoading(false);
    } else {
      setTransitioning(true);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* ═══════════════ INTRO WELCOME SCREEN ═══════════════ */}
      {showIntro && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-700 cursor-pointer ${
            introFading ? "opacity-0" : "opacity-100"
          }`}
          onClick={endIntro}
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 intro-bg" />

          {/* Animated particles */}
          <div className="absolute inset-0 overflow-hidden">
            {PARTICLES.map((p, i) => (
              <div
                key={i}
                className="intro-particle"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: `${p.w}px`,
                  height: `${p.h}px`,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.dur}s`,
                }}
              />
            ))}
          </div>

          {/* Decorative glowing lines */}
          <div className="absolute top-1/2 left-0 right-0 h-px intro-line" />
          <div className="absolute top-[calc(50%-60px)] left-0 right-0 h-px intro-line-thin" style={{ animationDelay: "0.3s" }} />
          <div className="absolute top-[calc(50%+60px)] left-0 right-0 h-px intro-line-thin" style={{ animationDelay: "0.6s" }} />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl">
            {/* Logos */}
            <div className="intro-logo mb-8 flex items-center gap-6">
              <div className="w-24 h-24 rounded-3xl bg-white/95 flex items-center justify-center shadow-2xl shadow-amber-500/20 overflow-hidden">
                <Image src="/pu-logo-png_seeklogo-355609.png" alt="Logo PU" width={68} height={68} className="object-contain" />
              </div>
              <div className="w-24 h-24 rounded-3xl bg-white/95 flex items-center justify-center shadow-2xl shadow-amber-500/20 overflow-hidden">
                <Image src="/LOGO%20BPSDM%20WIL%208.jpg" alt="Logo BPSDM Wilayah 8" width={68} height={68} className="object-contain" />
              </div>
            </div>

            {/* Welcome text */}
            <div className="intro-text-container">
              <p className="intro-subtitle text-amber-300/90 text-sm font-semibold tracking-[0.4em] uppercase mb-4">
                Selamat Datang di
              </p>
              <h1 className="intro-title text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
                <span className="intro-title-gradient">Sistem Kearsipan</span>
              </h1>
              <h2 className="intro-title-2 text-xl sm:text-2xl md:text-3xl font-bold mt-3 text-white/90 leading-snug">
                Balai Pengembangan Kompetensi
              </h2>
              <h3 className="intro-title-3 text-xl sm:text-2xl md:text-3xl font-bold mt-1 text-white/90">
                PU Wilayah 8 Makassar
              </h3>
            </div>

            {/* Decorative divider */}
            <div className="intro-divider mt-8 mb-6 flex items-center gap-3">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-400/50" />
              <div className="w-2 h-2 rounded-full bg-amber-400/60" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-400/50" />
            </div>

            {/* Tagline */}
            <p className="intro-tagline text-white/40 text-xs tracking-[0.3em] uppercase">
              Arsip Digital • Terpadu • Terpercaya
            </p>
          </div>

          {/* Skip hint */}
          <p className="absolute bottom-8 text-white/20 text-xs tracking-widest uppercase intro-skip">
            Click anywhere to continue
          </p>
        </div>
      )}

      {/* ═══════════════ LOGIN PAGE ═══════════════ */}
      <div className={`min-h-screen flex items-center justify-center relative overflow-hidden transition-opacity duration-500 ${
        showIntro && !introFading ? "opacity-0" : "opacity-100"
      }`}>
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900" />
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        
        {/* Floating orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "0.7s" }} />

        <div className={`relative z-10 w-full max-w-md px-4 ${!showIntro ? "animate-fade-in-up" : ""}`}>
          {/* Logo & Branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl mb-5 shadow-2xl shadow-blue-500/30 animate-pulse-glow overflow-hidden">
              <Image src="/pu-logo-png_seeklogo-355609.png" alt="Logo" width={56} height={56} className="object-contain" />
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
              <h2 className="text-lg font-semibold text-white">Sign In</h2>
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
                    placeholder="Enter password"
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
                      Verifying...
                    </>
                  ) : (
                    "Sign In"
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
            <p className="text-blue-300/30 text-xs mt-2">
              Dibuat Oleh : <span className="text-blue-300/50 font-medium">MUH. ULIL AMRI, S.Kom. MTCNA</span>
            </p>
          </div>
        </div>

        {/* ── Zoom-out & Fade Transition ── */}
        {transitioning && (
          <div className="login-transition-overlay" aria-hidden="true">
            <div className="login-transition-content flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/90 flex items-center justify-center shadow-2xl overflow-hidden">
                <Image src="/pu-logo-png_seeklogo-355609.png" alt="Logo" width={44} height={44} className="object-contain" />
              </div>
              <span className="text-sm font-bold text-white tracking-widest uppercase">
                Arsip Bapekom
              </span>
              <div className="flex items-center gap-2 mt-1">
                <Loader2 size={14} className="text-blue-300 animate-spin" />
                <span className="text-xs text-blue-300/70">Loading dashboard...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
