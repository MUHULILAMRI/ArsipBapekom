"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  HardDrive,
  Cloud,
  CheckCircle,
  XCircle,
  ExternalLink,
  Loader2,
  Settings,
  Zap,
  FolderSync,
  RefreshCw,
  Info,
  ShieldCheck,
} from "lucide-react";

interface StorageStatus {
  google: boolean;
  onedrive: boolean;
}

function StorageContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<StorageStatus>({
    google: false,
    onedrive: false,
  });
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");

    if (connected === "google") {
      setMessage({ type: "success", text: "Google Drive berhasil terhubung!" });
      setStatus((prev) => ({ ...prev, google: true }));
    }
    if (error) {
      setMessage({ type: "error", text: `Gagal menghubungkan: ${error}` });
    }

    checkStorageStatus();
  }, [searchParams]);

  const checkStorageStatus = async () => {
    setLoading(false);
  };

  const connectGoogle = async () => {
    setConnecting("google");
    try {
      const res = await fetch("/api/storage/connect-google");
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Failed to connect Google:", error);
      setConnecting(null);
    }
  };

  const connectOneDrive = async () => {
    setConnecting("onedrive");
    try {
      const res = await fetch("/api/storage/connect-onedrive");
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank", "width=600,height=700");
      }
    } catch (error) {
      console.error("Failed to connect OneDrive:", error);
    } finally {
      setConnecting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-fade-in-up">
        <Loader2 size={32} className="text-blue-500 animate-spin mb-4" />
        <p className="text-gray-400 text-sm">Memuat konfigurasi storage...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-violet-100 rounded-xl">
            <Settings size={20} className="text-violet-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Konfigurasi Storage
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              Hubungkan cloud storage untuk menyimpan file arsip
            </p>
          </div>
        </div>
      </div>

      {/* Alert Message */}
      {message && (
        <div
          className={`mb-8 p-4 rounded-2xl border flex items-center gap-3 animate-fade-in-up ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle size={20} className="text-emerald-500 shrink-0" />
          ) : (
            <XCircle size={20} className="text-red-500 shrink-0" />
          )}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {/* Storage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Google Drive Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all hover:border-gray-200">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <HardDrive size={28} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">
                  Google Drive
                </h2>
                <p className="text-sm text-gray-400">
                  Simpan file arsip ke Google Drive
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <div className="mb-5">
              {status.google ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-sm text-emerald-700 font-medium">
                    Terhubung
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl">
                  <div className="w-2 h-2 bg-gray-300 rounded-full" />
                  <span className="text-sm text-gray-500">Belum terhubung</span>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <FolderSync size={14} className="text-blue-400" />
                <span>Auto-organisasi folder per divisi</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <ShieldCheck size={14} className="text-blue-400" />
                <span>Enkripsi & keamanan Google</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Zap size={14} className="text-blue-400" />
                <span>Upload cepat & reliable</span>
              </div>
            </div>

            <button
              onClick={connectGoogle}
              disabled={connecting === "google"}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                status.google
                  ? "border border-gray-200 text-gray-700 hover:bg-gray-50"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-300"
              } disabled:opacity-50`}
            >
              {connecting === "google" ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Menghubungkan...
                </>
              ) : status.google ? (
                <>
                  <RefreshCw size={16} />
                  Hubungkan Ulang
                </>
              ) : (
                <>
                  <ExternalLink size={16} />
                  Hubungkan Google Account
                </>
              )}
            </button>
          </div>
        </div>

        {/* OneDrive Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all hover:border-gray-200">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="p-3 bg-gradient-to-br from-sky-50 to-sky-100 rounded-xl">
                <Cloud size={28} className="text-sky-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">
                  OneDrive
                </h2>
                <p className="text-sm text-gray-400">
                  Simpan file arsip ke Microsoft OneDrive
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <div className="mb-5">
              {status.onedrive ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-sm text-emerald-700 font-medium">
                    Terhubung
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl">
                  <div className="w-2 h-2 bg-gray-300 rounded-full" />
                  <span className="text-sm text-gray-500">Belum terhubung</span>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <FolderSync size={14} className="text-sky-400" />
                <span>Sinkronisasi otomatis</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <ShieldCheck size={14} className="text-sky-400" />
                <span>Keamanan Microsoft 365</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Zap size={14} className="text-sky-400" />
                <span>Integrasi Office 365</span>
              </div>
            </div>

            <button
              onClick={connectOneDrive}
              disabled={connecting === "onedrive"}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                status.onedrive
                  ? "border border-gray-200 text-gray-700 hover:bg-gray-50"
                  : "bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md shadow-sky-200 hover:from-sky-700 hover:to-blue-700 hover:shadow-lg hover:shadow-sky-300"
              } disabled:opacity-50`}
            >
              {connecting === "onedrive" ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Menghubungkan...
                </>
              ) : status.onedrive ? (
                <>
                  <RefreshCw size={16} />
                  Hubungkan Ulang
                </>
              ) : (
                <>
                  <ExternalLink size={16} />
                  Hubungkan Microsoft Account
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 rounded-xl shrink-0">
            <Info size={18} className="text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-amber-900 mb-3">
              Petunjuk Konfigurasi
            </h3>
            <ul className="text-sm text-amber-700/80 space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 shrink-0" />
                <span>
                  Pastikan Anda sudah mengatur Google Cloud Console / Azure AD
                  untuk mendapatkan Client ID dan Secret.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 shrink-0" />
                <span>
                  Hanya satu storage yang bisa aktif pada satu waktu.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 shrink-0" />
                <span>
                  File arsip akan otomatis diorganisir berdasarkan folder divisi
                  di cloud storage.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 shrink-0" />
                <span>
                  Token akan di-refresh otomatis saat kedaluwarsa.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StoragePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-32 animate-fade-in-up">
          <Loader2 size={32} className="text-blue-500 animate-spin mb-4" />
          <p className="text-gray-400 text-sm">Memuat konfigurasi storage...</p>
        </div>
      }
    >
      <StorageContent />
    </Suspense>
  );
}
