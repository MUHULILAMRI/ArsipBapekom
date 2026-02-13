"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  HardDrive,
  Cloud,
  CheckCircle,
  XCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface StorageStatus {
  google: boolean;
  onedrive: boolean;
}

export default function StoragePage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<StorageStatus>({
    google: false,
    onedrive: false,
  });
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
    // In a real app, you'd check the StorageConfig table
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Konfigurasi Storage
        </h1>
        <p className="text-gray-500 mt-1">
          Hubungkan akun cloud storage untuk menyimpan file arsip
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg border ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Google Drive */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <HardDrive size={28} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Google Drive
              </h2>
              <p className="text-sm text-gray-500">
                Simpan file arsip ke Google Drive
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            {status.google ? (
              <>
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-sm text-green-700 font-medium">
                  Terhubung
                </span>
              </>
            ) : (
              <>
                <XCircle size={16} className="text-gray-400" />
                <span className="text-sm text-gray-500">Belum terhubung</span>
              </>
            )}
          </div>

          <button
            onClick={connectGoogle}
            disabled={connecting === "google"}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {connecting === "google" ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Menghubungkan...
              </>
            ) : (
              <>
                <ExternalLink size={16} />
                {status.google ? "Hubungkan Ulang" : "Hubungkan Google Account"}
              </>
            )}
          </button>
        </div>

        {/* OneDrive */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-sky-50 rounded-xl">
              <Cloud size={28} className="text-sky-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">OneDrive</h2>
              <p className="text-sm text-gray-500">
                Simpan file arsip ke Microsoft OneDrive
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            {status.onedrive ? (
              <>
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-sm text-green-700 font-medium">
                  Terhubung
                </span>
              </>
            ) : (
              <>
                <XCircle size={16} className="text-gray-400" />
                <span className="text-sm text-gray-500">Belum terhubung</span>
              </>
            )}
          </div>

          <button
            onClick={connectOneDrive}
            disabled={connecting === "onedrive"}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {connecting === "onedrive" ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Menghubungkan...
              </>
            ) : (
              <>
                <ExternalLink size={16} />
                {status.onedrive
                  ? "Hubungkan Ulang"
                  : "Hubungkan Microsoft Account"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-amber-800 mb-2">
          Petunjuk Konfigurasi
        </h3>
        <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
          <li>
            Pastikan Anda sudah mengatur Google Cloud Console / Azure AD untuk
            mendapatkan Client ID dan Secret.
          </li>
          <li>
            Hanya satu storage yang bisa aktif pada satu waktu.
          </li>
          <li>
            File arsip akan otomatis diorganisir berdasarkan folder divisi di
            cloud storage.
          </li>
          <li>
            Token akan di-refresh otomatis saat kedaluwarsa.
          </li>
        </ul>
      </div>
    </div>
  );
}
