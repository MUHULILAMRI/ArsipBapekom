"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  FileClock,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  Archive,
  User,
  CalendarDays,
  MessageSquare,
  MoreVertical,
  X,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface BorrowRequest {
  id: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "RETURNED";
  adminNotes: string | null;
  borrowDate: string;
  returnDate: string | null;
  createdAt: string;
  archive: {
    id: string;
    archiveNumber: string;
    title: string;
    division: string;
    noBerkas: string | null;
    indeks: string | null;
    status: string;
    fileUrl?: string | null;
  };
  user: {
    id: string;
    name: string;
    email: string;
    division: string;
  };
}

interface Summary {
  pendingCount: number;
  approvedCount: number;
  returnedCount: number;
  rejectedCount: number;
}

const DIVISION_LABELS: Record<string, string> = {
  KEUANGAN: "Keuangan",
  PENYELENGGARA: "Penyelenggara",
  TATA_USAHA: "Tata Usaha",
  UMUM: "Umum",
};

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  PENDING: { label: "Menunggu", className: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  APPROVED: { label: "Disetujui", className: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  REJECTED: { label: "Ditolak", className: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
  RETURNED: { label: "Dikembalikan", className: "bg-blue-50 text-blue-700 border-blue-200", icon: Package },
};

interface ActionModalProps {
  request: BorrowRequest;
  action: "APPROVED" | "REJECTED" | "RETURNED";
  onConfirm: (id: string, action: string, notes: string) => Promise<void>;
  onClose: () => void;
}

function ActionModal({ request, action, onConfirm, onClose }: ActionModalProps) {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const archiveLabel = request.archive.noBerkas || request.archive.indeks || request.archive.archiveNumber || request.archive.title;

  const actionConfig = {
    APPROVED: { label: "Setujui", btnClass: "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20", icon: CheckCircle2 },
    REJECTED: { label: "Tolak", btnClass: "bg-red-600 hover:bg-red-500 shadow-red-500/20", icon: XCircle },
    RETURNED: { label: "Tandai Dikembalikan", btnClass: "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20", icon: Package },
  };

  const cfg = actionConfig[action];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onConfirm(request.id, action, notes);
    setLoading(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 animate-scale-in">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${action === "APPROVED" ? "bg-emerald-100" : action === "REJECTED" ? "bg-red-100" : "bg-blue-100"}`}>
              <cfg.icon size={20} className={action === "APPROVED" ? "text-emerald-600" : action === "REJECTED" ? "text-red-600" : "text-blue-600"} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">{cfg.label} Peminjaman</h2>
              <p className="text-xs text-gray-500 mt-0.5">Arsip: {archiveLabel}</p>
            </div>
          </div>
          <button onClick={onClose} disabled={loading} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all disabled:opacity-50">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-5">
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 mb-4">
              <p className="text-xs text-gray-500 mb-1">Alasan pemohon:</p>
              <p className="text-sm text-gray-800 italic">"{request.reason}"</p>
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Catatan Admin <span className="text-gray-400">(opsional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              disabled={loading}
              placeholder={
                action === "APPROVED" ? "Contoh: Disetujui untuk keperluan audit..." :
                action === "REJECTED" ? "Contoh: Arsip sedang digunakan divisi lain..." :
                "Contoh: Dokumen dikembalikan dalam kondisi lengkap..."
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all resize-none disabled:opacity-60"
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} disabled={loading} className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50">
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white text-sm font-semibold transition-all shadow-lg active:scale-[0.98] disabled:opacity-60 ${cfg.btnClass}`}
            >
              {loading ? <><Loader2 size={16} className="animate-spin" />Memproses...</> : <><cfg.icon size={16} />{cfg.label}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BorrowPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "USER";
  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN";

  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [summary, setSummary] = useState<Summary>({ pendingCount: 0, approvedCount: 0, returnedCount: 0, rejectedCount: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionModal, setActionModal] = useState<{ request: BorrowRequest; action: "APPROVED" | "REJECTED" | "RETURNED" } | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/borrow?${params.toString()}`);
      const data = await res.json().catch(() => ({}));
      setRequests(data.requests || []);
      setSummary(data.summary || { pendingCount: 0, approvedCount: 0, returnedCount: 0, rejectedCount: 0 });
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleActionConfirm = async (id: string, action: string, notes: string) => {
    try {
      const res = await fetch(`/api/borrow/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action, adminNotes: notes }),
      });
      if (res.ok) {
        setActionModal(null);
        fetchRequests();
      }
    } catch {
      // handle silently
    }
  };

  const handleCancelRequest = async (id: string) => {
    if (!confirm("Batalkan permohonan peminjaman ini?")) return;
    try {
      await fetch(`/api/borrow/${id}`, { method: "DELETE" });
      fetchRequests();
    } catch {
      // handle silently
    }
  };

  const summaryCards = [
    { label: "Menunggu", count: summary.pendingCount, icon: Clock, className: "from-amber-50 to-orange-50 border-amber-100", iconClass: "bg-amber-100 text-amber-600", textClass: "text-amber-700" },
    { label: "Disetujui", count: summary.approvedCount, icon: CheckCircle2, className: "from-emerald-50 to-green-50 border-emerald-100", iconClass: "bg-emerald-100 text-emerald-600", textClass: "text-emerald-700" },
    { label: "Dikembalikan", count: summary.returnedCount, icon: Package, className: "from-blue-50 to-sky-50 border-blue-100", iconClass: "bg-blue-100 text-blue-600", textClass: "text-blue-700" },
    { label: "Ditolak", count: summary.rejectedCount, icon: XCircle, className: "from-red-50 to-rose-50 border-red-100", iconClass: "bg-red-100 text-red-600", textClass: "text-red-700" },
  ];

  const STATUS_FILTERS = [
    { value: "", label: "Semua" },
    { value: "PENDING", label: "Menunggu" },
    { value: "APPROVED", label: "Disetujui" },
    { value: "RETURNED", label: "Dikembalikan" },
    { value: "REJECTED", label: "Ditolak" },
  ];

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <FileClock size={20} className="text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Peminjaman Arsip</h1>
          </div>
          <p className="text-gray-500 mt-1 ml-12">
            {isAdmin ? "Kelola semua permohonan peminjaman arsip" : "Riwayat dan status permohonan peminjaman Anda"}
          </p>
        </div>
        <button
          onClick={fetchRequests}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            onClick={() => { setStatusFilter(card.label === "Menunggu" ? "PENDING" : card.label === "Disetujui" ? "APPROVED" : card.label === "Dikembalikan" ? "RETURNED" : card.label === "Ditolak" ? "REJECTED" : ""); setPage(1); }}
            className={`bg-gradient-to-br ${card.className} border rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-xl ${card.iconClass}`}>
                <card.icon size={18} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${card.textClass}`}>{card.count}</p>
            <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { setStatusFilter(f.value); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              statusFilter === f.value
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
            <Loader2 size={24} className="animate-spin" />
            <span className="text-sm">Memuat data peminjaman...</span>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="p-4 bg-gray-50 rounded-2xl">
              <FileClock size={32} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">Belum ada permohonan peminjaman</p>
            <p className="text-xs text-gray-400">Klik ikon 🕐 pada daftar arsip untuk mengajukan peminjaman</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Arsip</th>
                    {isAdmin && <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pemohon</th>}
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Alasan</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Catatan Admin</th>
                    {isAdmin && <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Aksi</th>}
                    {!isAdmin && <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Batal</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {requests.map((req) => {
                    const statusCfg = STATUS_CONFIG[req.status];
                    const StatusIcon = statusCfg.icon;
                    const archiveLabel = req.archive.noBerkas || req.archive.indeks || req.archive.archiveNumber || req.archive.title;
                    return (
                      <tr key={req.id} className="hover:bg-gray-50/50 transition-colors group">
                        {/* Archive */}
                        <td className="px-5 py-4">
                          <div className="flex items-start gap-2.5">
                            <div className="p-1.5 bg-blue-50 rounded-lg mt-0.5">
                              <Archive size={14} className="text-blue-500" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">{archiveLabel}</p>
                              <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{req.archive.title}</p>
                              <span className="mt-1 inline-flex px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 rounded">
                                {DIVISION_LABELS[req.archive.division] || req.archive.division}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Pemohon (admin only) */}
                        {isAdmin && (
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
                                {req.user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-800">{req.user.name}</p>
                                <p className="text-xs text-gray-400">{DIVISION_LABELS[req.user.division] || req.user.division}</p>
                              </div>
                            </div>
                          </td>
                        )}

                        {/* Alasan */}
                        <td className="px-5 py-4 max-w-[180px]">
                          <p className="text-sm text-gray-600 line-clamp-2">{req.reason}</p>
                        </td>

                        {/* Tanggal */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <CalendarDays size={13} />
                            {format(new Date(req.createdAt), "dd MMM yyyy", { locale: idLocale })}
                          </div>
                          {req.returnDate && (
                            <div className="flex items-center gap-1.5 text-xs text-blue-500 mt-1">
                              <Package size={13} />
                              Kembali: {format(new Date(req.returnDate), "dd MMM yyyy", { locale: idLocale })}
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1.5 items-start">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${statusCfg.className}`}>
                              <StatusIcon size={12} />
                              {statusCfg.label}
                            </span>
                            {req.status === "APPROVED" && req.archive.fileUrl && (
                              <a
                                href={req.archive.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                              >
                                <Download size={11} />
                                Buka Dokumen
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Catatan Admin */}
                        <td className="px-5 py-4 max-w-[160px]">
                          {req.adminNotes ? (
                            <div className="flex items-start gap-1.5">
                              <MessageSquare size={13} className="text-gray-400 mt-0.5 shrink-0" />
                              <p className="text-xs text-gray-600 line-clamp-2">{req.adminNotes}</p>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>

                        {/* Admin Actions */}
                        {isAdmin && (
                          <td className="px-5 py-4 text-center">
                            <div className="relative inline-block">
                              {req.status === "PENDING" && (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => setActionModal({ request: req, action: "APPROVED" })}
                                    className="px-3 py-1.5 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-all"
                                  >
                                    Setujui
                                  </button>
                                  <button
                                    onClick={() => setActionModal({ request: req, action: "REJECTED" })}
                                    className="px-3 py-1.5 text-xs font-semibold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
                                  >
                                    Tolak
                                  </button>
                                </div>
                              )}
                              {req.status === "APPROVED" && (
                                <button
                                  onClick={() => setActionModal({ request: req, action: "RETURNED" })}
                                  className="px-3 py-1.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all"
                                >
                                  Kembalikan
                                </button>
                              )}
                              {(req.status === "REJECTED" || req.status === "RETURNED") && (
                                <span className="text-xs text-gray-300">—</span>
                              )}
                            </div>
                          </td>
                        )}

                        {/* User Cancel */}
                        {!isAdmin && (
                          <td className="px-5 py-4 text-center">
                            {req.status === "PENDING" ? (
                              <button
                                onClick={() => handleCancelRequest(req.id)}
                                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="Batalkan permohonan"
                              >
                                <X size={15} />
                              </button>
                            ) : (
                              <span className="text-xs text-gray-300">—</span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/40">
                <p className="text-xs text-gray-500">Halaman {page} dari {totalPages}</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-white transition-all"
                  >
                    <ChevronLeft size={15} className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-white transition-all"
                  >
                    <ChevronRight size={15} className="text-gray-600" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Action Modal */}
      {actionModal && (
        <ActionModal
          request={actionModal.request}
          action={actionModal.action}
          onConfirm={handleActionConfirm}
          onClose={() => setActionModal(null)}
        />
      )}
    </div>
  );
}
