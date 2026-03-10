"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "../../../../components/ThemeProvider";
import { useToast } from "../../../../components/Toast";
import {
  Palette,
  Sun,
  Moon,
  Monitor,
  Check,
  Save,
  Loader2,
  PanelLeft,
  SquareRoundCorner,
  Sparkles,
  Eye,
} from "lucide-react";

const colorPresets = [
  { name: "Biru", value: "#3b82f6", class: "bg-blue-500" },
  { name: "Indigo", value: "#6366f1", class: "bg-indigo-500" },
  { name: "Violet", value: "#8b5cf6", class: "bg-violet-500" },
  { name: "Pink", value: "#ec4899", class: "bg-pink-500" },
  { name: "Merah", value: "#ef4444", class: "bg-red-500" },
  { name: "Oranye", value: "#f97316", class: "bg-orange-500" },
  { name: "Amber", value: "#f59e0b", class: "bg-amber-500" },
  { name: "Hijau", value: "#10b981", class: "bg-emerald-500" },
  { name: "Teal", value: "#14b8a6", class: "bg-teal-500" },
  { name: "Cyan", value: "#06b6d4", class: "bg-cyan-500" },
];

const accentPresets = [
  { name: "Indigo", value: "#6366f1", class: "bg-indigo-500" },
  { name: "Violet", value: "#8b5cf6", class: "bg-violet-500" },
  { name: "Biru", value: "#3b82f6", class: "bg-blue-500" },
  { name: "Cyan", value: "#06b6d4", class: "bg-cyan-500" },
  { name: "Teal", value: "#14b8a6", class: "bg-teal-500" },
  { name: "Pink", value: "#ec4899", class: "bg-pink-500" },
  { name: "Rose", value: "#f43f5e", class: "bg-rose-500" },
  { name: "Amber", value: "#f59e0b", class: "bg-amber-500" },
];

export default function ThemeSettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { theme: currentTheme, refreshTheme } = useTheme();
  const { showToast } = useToast();

  const [mode, setMode] = useState("light");
  const [primaryColor, setPrimaryColor] = useState("#3b82f6");
  const [accentColor, setAccentColor] = useState("#6366f1");
  const [sidebarStyle, setSidebarStyle] = useState("dark");
  const [borderRadius, setBorderRadius] = useState("rounded");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    if (userRole && userRole !== "SUPER_ADMIN") {
      router.push("/dashboard");
    }
  }, [userRole, router]);

  useEffect(() => {
    if (currentTheme) {
      setMode(currentTheme.mode);
      setPrimaryColor(currentTheme.primaryColor);
      setAccentColor(currentTheme.accentColor);
      setSidebarStyle(currentTheme.sidebarStyle);
      setBorderRadius(currentTheme.borderRadius);
      setLoading(false);
    }
  }, [currentTheme]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          primaryColor,
          accentColor,
          sidebarStyle,
          borderRadius,
        }),
      });

      if (res.ok) {
        await refreshTheme();
        showToast("Tema berhasil diperbarui!", "success");
      } else {
        const data = await res.json();
        showToast(data.error || "Gagal menyimpan tema", "error");
      }
    } catch {
      showToast("Terjadi kesalahan saat menyimpan tema", "error");
    } finally {
      setSaving(false);
    }
  };

  if (userRole !== "SUPER_ADMIN") return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/20">
            <Palette size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Pengaturan Tema
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Atur tampilan aplikasi untuk semua pengguna
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Mode Tema */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            <Eye size={18} className="text-blue-500" />
            Mode Tampilan
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Pilih mode tampilan untuk aplikasi
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "light", label: "Terang", icon: Sun, desc: "Tampilan cerah" },
              { value: "dark", label: "Gelap", icon: Moon, desc: "Tampilan gelap" },
              { value: "system", label: "Sistem", icon: Monitor, desc: "Ikuti perangkat" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setMode(option.value)}
                className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                  mode === option.value
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                    : "border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600"
                }`}
              >
                {mode === option.value && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                )}
                <option.icon
                  size={24}
                  className={
                    mode === option.value
                      ? "text-blue-500"
                      : "text-gray-400 dark:text-gray-500"
                  }
                />
                <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                  {option.label}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {option.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Warna Primer */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            <Sparkles size={18} className="text-violet-500" />
            Warna Utama
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Warna utama yang digunakan pada tombol dan elemen interaktif
          </p>
          <div className="flex flex-wrap gap-3">
            {colorPresets.map((color) => (
              <button
                key={color.value}
                onClick={() => setPrimaryColor(color.value)}
                className={`group relative w-12 h-12 rounded-xl ${color.class} transition-all hover:scale-110 ${
                  primaryColor === color.value
                    ? "ring-2 ring-offset-2 ring-gray-900 dark:ring-white scale-110"
                    : ""
                }`}
                title={color.name}
              >
                {primaryColor === color.value && (
                  <Check size={18} className="text-white absolute inset-0 m-auto" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Warna Aksen */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            <Palette size={18} className="text-pink-500" />
            Warna Aksen
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Warna sekunder untuk gradien dan highlight
          </p>
          <div className="flex flex-wrap gap-3">
            {accentPresets.map((color) => (
              <button
                key={color.value}
                onClick={() => setAccentColor(color.value)}
                className={`group relative w-12 h-12 rounded-xl ${color.class} transition-all hover:scale-110 ${
                  accentColor === color.value
                    ? "ring-2 ring-offset-2 ring-gray-900 dark:ring-white scale-110"
                    : ""
                }`}
                title={color.name}
              >
                {accentColor === color.value && (
                  <Check size={18} className="text-white absolute inset-0 m-auto" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar Style */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            <PanelLeft size={18} className="text-emerald-500" />
            Gaya Sidebar
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Pilih tampilan sidebar navigasi
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "dark", label: "Gelap", desc: "Sidebar dengan latar gelap" },
              { value: "light", label: "Terang", desc: "Sidebar dengan latar terang" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSidebarStyle(option.value)}
                className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                  sidebarStyle === option.value
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                    : "border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600"
                }`}
              >
                {sidebarStyle === option.value && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                )}
                {/* Mini sidebar preview */}
                <div className="flex gap-1 mb-3">
                  <div
                    className={`w-8 h-16 rounded-md ${
                      option.value === "dark" ? "bg-slate-800" : "bg-gray-100"
                    }`}
                  />
                  <div className="flex-1 h-16 rounded-md bg-gray-50 dark:bg-gray-700" />
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {option.label}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {option.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Border Radius */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            <SquareRoundCorner size={18} className="text-amber-500" />
            Bentuk Sudut
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Atur kelengkungan sudut elemen
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "sharp", label: "Tajam", radius: "rounded-md" },
              { value: "rounded", label: "Bulat", radius: "rounded-xl" },
              { value: "pill", label: "Pil", radius: "rounded-full" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setBorderRadius(option.value)}
                className={`relative p-4 rounded-xl border-2 transition-all text-center ${
                  borderRadius === option.value
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                    : "border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600"
                }`}
              >
                {borderRadius === option.value && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                )}
                <div
                  className={`w-16 h-10 mx-auto bg-blue-500 ${option.radius} mb-3`}
                />
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {option.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Eye size={18} className="text-blue-500" />
            Preview
          </h2>
          <div className={`p-6 rounded-2xl ${mode === "dark" ? "bg-gray-900" : "bg-gray-50"}`}>
            <div className="flex gap-3">
              {/* Mini sidebar preview */}
              <div
                className={`w-16 rounded-xl p-2 space-y-2 ${
                  sidebarStyle === "dark" ? "bg-slate-800" : "bg-white border border-gray-200"
                }`}
              >
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-3 rounded ${
                      sidebarStyle === "dark" ? "bg-slate-600" : "bg-gray-200"
                    } ${i === 1 ? "opacity-100" : "opacity-40"}`}
                  />
                ))}
              </div>
              {/* Main content preview */}
              <div className="flex-1 space-y-3">
                <div
                  className="h-6 w-32 rounded"
                  style={{ backgroundColor: primaryColor, borderRadius: borderRadius === "sharp" ? "4px" : borderRadius === "pill" ? "9999px" : "8px" }}
                />
                <div className="flex gap-2">
                  <div
                    className={`h-16 flex-1 ${mode === "dark" ? "bg-gray-800" : "bg-white"} border ${mode === "dark" ? "border-gray-700" : "border-gray-200"}`}
                    style={{ borderRadius: borderRadius === "sharp" ? "6px" : borderRadius === "pill" ? "16px" : "12px" }}
                  />
                  <div
                    className={`h-16 flex-1 ${mode === "dark" ? "bg-gray-800" : "bg-white"} border ${mode === "dark" ? "border-gray-700" : "border-gray-200"}`}
                    style={{ borderRadius: borderRadius === "sharp" ? "6px" : borderRadius === "pill" ? "16px" : "12px" }}
                  />
                </div>
                <div
                  className="h-4 w-20 rounded opacity-60"
                  style={{ backgroundColor: accentColor, borderRadius: borderRadius === "sharp" ? "4px" : borderRadius === "pill" ? "9999px" : "8px" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pb-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save size={18} />
                Simpan Pengaturan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
