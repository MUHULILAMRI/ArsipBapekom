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
  BarChart3,
  FileText,
  Clock,
  TrendingUp,
  Database,
  Activity,
  Wifi,
  WifiOff,
  ArrowUpRight,
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface StorageStatus {
  google: boolean;
  onedrive: boolean;
}

interface StorageInfo {
  storage: {
    google: {
      connected: boolean;
      expiresAt?: string;
      isExpired?: boolean;
      connectedSince?: string;
      lastUpdated?: string;
    };
  };
  stats: {
    totalFiles: number;
    divisionStats: { division: string; count: number }[];
    statusStats: { status: string; count: number }[];
    monthlyUploads: Record<string, number>;
    recentUploads: {
      id: string;
      title: string;
      fileUrl: string;
      division: string;
      createdAt: string;
      user: { name: string };
    }[];
    oldestArchive: string | null;
    newestArchive: string | null;
  };
}

const DIVISION_LABELS: Record<string, string> = {
  KEUANGAN: "Keuangan",
  PENYELENGGARA: "Penyelenggara",
  TATA_USAHA: "Tata Usaha",
  UMUM: "Umum",
};

const DIVISION_COLORS: Record<string, string> = {
  KEUANGAN: "from-emerald-500 to-teal-500",
  PENYELENGGARA: "from-blue-500 to-indigo-500",
  TATA_USAHA: "from-amber-500 to-orange-500",
  UMUM: "from-purple-500 to-violet-500",
};

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

function getMonthlyChartData(monthlyUploads: Record<string, number>) {
  const data: { label: string; count: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    data.push({ label: MONTH_NAMES[d.getMonth()], count: monthlyUploads[key] || 0 });
  }
  return data;
}

function StorageContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<StorageStatus>({ google: false, onedrive: false });
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [infoLoading, setInfoLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"config" | "monitor">("monitor");
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

    setLoading(false);
    fetchStorageInfo();
  }, [searchParams]);

  const fetchStorageInfo = async () => {
    try {
      const res = await fetch("/api/storage/info");
      if (res.ok) {
        const data: StorageInfo = await res.json();
        setStorageInfo(data);
        if (data.storage.google.connected) {
          setStatus((prev) => ({ ...prev, google: true }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch storage info:", err);
    } finally {
      setInfoLoading(false);
    }
  };

  const connectGoogle = async () => {
    setConnecting("google");
    try {
      const res = await fetch("/api/storage/connect-google");
      const data = await res.json();
      if (data.url) window.location.href = data.url;
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
      if (data.url) window.open(data.url, "_blank", "width=600,height=700");
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

  const chartData = getMonthlyChartData(storageInfo?.stats.monthlyUploads || {});
  const maxUpload = Math.max(...chartData.map((d) => d.count), 1);

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-100 rounded-xl">
            <HardDrive size={20} className="text-violet-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Storage</h1>
            <p className="text-gray-400 text-sm mt-0.5">Konfigurasi & pemantauan cloud storage</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab("monitor")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "monitor"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Activity size={15} />
            Pemantauan
          </button>
          <button
            onClick={() => setActiveTab("config")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "config"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Settings size={15} />
            Konfigurasi
          </button>
        </div>
      </div>

      {/* Alert Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 animate-fade-in-up ${
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

      {/* ─── MONITOR TAB ─── */}
      {activeTab === "monitor" && (
        <div className="space-y-6">
          {/* Top Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Connection Status */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Status Koneksi
                </span>
                {status.google ? (
                  <Wifi size={16} className="text-emerald-500" />
                ) : (
                  <WifiOff size={16} className="text-gray-300" />
                )}
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    status.google ? "bg-emerald-500 animate-pulse" : "bg-gray-300"
                  }`}
                />
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {status.google ? "Terhubung" : "Tidak Terhubung"}
                  </p>
                  <p className="text-xs text-gray-400">Google Drive</p>
                </div>
              </div>
              {storageInfo?.storage.google.connected &&
                storageInfo.storage.google.connectedSince && (
                  <p className="text-[10px] text-gray-400 mt-3">
                    Terhubung sejak{" "}
                    {format(new Date(storageInfo.storage.google.connectedSince), "dd MMM yyyy", {
                      locale: idLocale,
                    })}
                  </p>
                )}
            </div>

            {/* Total Files */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Total File
                </span>
                <Database size={16} className="text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {infoLoading ? "..." : storageInfo?.stats.totalFiles || 0}
              </p>
              <p className="text-xs text-gray-400 mt-1">dokumen tersimpan</p>
            </div>

            {/* Token Status */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Token
                </span>
                <ShieldCheck
                  size={16}
                  className={
                    storageInfo?.storage.google.isExpired
                      ? "text-red-500"
                      : storageInfo?.storage.google.connected
                        ? "text-emerald-500"
                        : "text-gray-300"
                  }
                />
              </div>
              {storageInfo?.storage.google.connected ? (
                <>
                  <p className="text-sm font-bold text-gray-900">
                    {storageInfo.storage.google.isExpired ? "Kadaluarsa" : "Valid"}
                  </p>
                  {storageInfo.storage.google.expiresAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      {storageInfo.storage.google.isExpired ? "Expired" : "Berlaku"} hingga{" "}
                      {format(new Date(storageInfo.storage.google.expiresAt), "dd MMM yyyy HH:mm", {
                        locale: idLocale,
                      })}
                    </p>
                  )}
                  {storageInfo.storage.google.lastUpdated && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      Terakhir diperbarui:{" "}
                      {format(
                        new Date(storageInfo.storage.google.lastUpdated),
                        "dd MMM yyyy HH:mm",
                        { locale: idLocale }
                      )}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm font-medium text-gray-400">Belum dikonfigurasi</p>
              )}
            </div>
          </div>

          {/* Upload Trend Chart + Division Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload Trend */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp size={16} className="text-blue-500" />
                  Tren Upload 6 Bulan Terakhir
                </h2>
              </div>
              {infoLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 size={24} className="text-gray-300 animate-spin" />
                </div>
              ) : (
                <div className="flex items-end gap-2 h-40">
                  {chartData.map((item, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-700">{item.count}</span>
                      <div className="w-full relative">
                        <div
                          className="w-full bg-gradient-to-t from-blue-500 to-indigo-400 rounded-t-lg transition-all duration-500 min-h-[4px]"
                          style={{ height: `${(item.count / maxUpload) * 120}px` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Division Breakdown */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <BarChart3 size={16} className="text-violet-500" />
                Per Divisi
              </h2>
              {infoLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 size={24} className="text-gray-300 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {(storageInfo?.stats.divisionStats || []).map((d) => {
                    const total = storageInfo?.stats.totalFiles || 1;
                    const pct = Math.round((d.count / total) * 100);
                    return (
                      <div key={d.division}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-gray-600">
                            {DIVISION_LABELS[d.division] || d.division}
                          </span>
                          <span className="text-xs font-bold text-gray-800">{d.count}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                          <div
                            className={`bg-gradient-to-r ${
                              DIVISION_COLORS[d.division] || "from-gray-400 to-gray-500"
                            } h-2.5 rounded-full transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}

                  {/* Status split */}
                  <div className="pt-4 mt-4 border-t border-gray-50">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Status
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {(storageInfo?.stats.statusStats || []).map((s) => (
                        <div
                          key={s.status}
                          className={`text-center p-3 rounded-xl ${
                            s.status === "AKTIF" ? "bg-emerald-50" : "bg-orange-50"
                          }`}
                        >
                          <p
                            className={`text-lg font-bold ${
                              s.status === "AKTIF" ? "text-emerald-700" : "text-orange-700"
                            }`}
                          >
                            {s.count}
                          </p>
                          <p
                            className={`text-[10px] font-medium ${
                              s.status === "AKTIF" ? "text-emerald-600" : "text-orange-600"
                            }`}
                          >
                            {s.status === "AKTIF" ? "Aktif" : "Inaktif"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Uploads */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock size={16} className="text-blue-500" />
              Upload Terbaru
            </h2>
            {infoLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="text-gray-300 animate-spin" />
              </div>
            ) : (storageInfo?.stats.recentUploads || []).length === 0 ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <FileText size={24} className="text-gray-300" />
                </div>
                <p className="text-gray-400 text-sm font-medium">Belum ada file yang diupload</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {(storageInfo?.stats.recentUploads || []).map((upload) => (
                  <div key={upload.id} className="flex items-center gap-4 py-3">
                    <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                      <FileText size={16} className="text-blue-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-800 truncate">{upload.title}</p>
                      <p className="text-[11px] text-gray-400">
                        {upload.user.name} &middot;{" "}
                        {DIVISION_LABELS[upload.division] || upload.division} &middot;{" "}
                        {format(new Date(upload.createdAt), "dd MMM yyyy HH:mm", {
                          locale: idLocale,
                        })}
                      </p>
                    </div>
                    <a
                      href={upload.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all shrink-0"
                    >
                      <ArrowUpRight size={16} />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── CONFIG TAB ─── */}
      {activeTab === "config" && (
        <div className="space-y-6">
          {/* Storage Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Google Drive Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all hover:border-gray-200">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-5">
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                    <HardDrive size={28} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900">Google Drive</h2>
                    <p className="text-sm text-gray-400">Simpan file arsip ke Google Drive</p>
                  </div>
                </div>

                <div className="mb-5">
                  {status.google ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-sm text-emerald-700 font-medium">Terhubung</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl">
                      <div className="w-2 h-2 bg-gray-300 rounded-full" />
                      <span className="text-sm text-gray-500">Belum terhubung</span>
                    </div>
                  )}
                </div>

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
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200 hover:from-blue-700 hover:to-indigo-700"
                  } disabled:opacity-50`}
                >
                  {connecting === "google" ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Menghubungkan...
                    </>
                  ) : status.google ? (
                    <>
                      <RefreshCw size={16} /> Hubungkan Ulang
                    </>
                  ) : (
                    <>
                      <ExternalLink size={16} /> Hubungkan Google Account
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
                    <h2 className="text-lg font-semibold text-gray-900">OneDrive</h2>
                    <p className="text-sm text-gray-400">
                      Simpan file arsip ke Microsoft OneDrive
                    </p>
                  </div>
                </div>

                <div className="mb-5">
                  {status.onedrive ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-sm text-emerald-700 font-medium">Terhubung</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl">
                      <div className="w-2 h-2 bg-gray-300 rounded-full" />
                      <span className="text-sm text-gray-500">Belum terhubung</span>
                    </div>
                  )}
                </div>

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
                      : "bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md shadow-sky-200 hover:from-sky-700 hover:to-blue-700"
                  } disabled:opacity-50`}
                >
                  {connecting === "onedrive" ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Menghubungkan...
                    </>
                  ) : status.onedrive ? (
                    <>
                      <RefreshCw size={16} /> Hubungkan Ulang
                    </>
                  ) : (
                    <>
                      <ExternalLink size={16} /> Hubungkan Microsoft Account
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
                      Pastikan Anda sudah mengatur Google Cloud Console / Azure AD untuk
                      mendapatkan Client ID dan Secret.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 shrink-0" />
                    <span>Hanya satu storage yang bisa aktif pada satu waktu.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 shrink-0" />
                    <span>
                      File arsip akan otomatis diorganisir berdasarkan folder divisi di cloud
                      storage.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 shrink-0" />
                    <span>Token akan di-refresh otomatis saat kedaluwarsa.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
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
