"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Users,
  UserCheck,
  UserX,
  Search,
  RefreshCw,
  Loader2,
  Building2,
  CalendarDays,
  FileClock,
  CheckCircle2,
  XCircle,
  Package,
  Clock,
  Trash2,
  ShieldOff,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface BorrowStats {
  total: number;
  pending: number;
  approved: number;
  returned: number;
  rejected: number;
}

interface Peminjam {
  id: string;
  name: string;
  email: string;
  instansi: string | null;
  isActive: boolean;
  createdAt: string;
  borrowStats: BorrowStats;
}

interface Summary {
  totalAll: number;
  totalActive: number;
  totalSuspended: number;
  totalBorrowAll: number;
}

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  confirmClass: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

function ConfirmDialog({ title, message, confirmLabel, confirmClass, onConfirm, onCancel, loading }: ConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onCancel(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100 p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-amber-100 rounded-xl shrink-0">
            <AlertCircle size={20} className="text-amber-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50">
            Batal
          </button>
          <button onClick={onConfirm} disabled={loading} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold transition-all shadow-lg disabled:opacity-60 ${confirmClass}`}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPeminjamPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "";
  const isSuperAdmin = userRole === "SUPER_ADMIN";

  const [peminjam, setPeminjam] = useState<Peminjam[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalAll: 0, totalActive: 0, totalSuspended: 0, totalBorrowAll: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);

  // Confirm dialog state
  const [confirm, setConfirm] = useState<{
    type: "suspend" | "activate" | "delete";
    target: Peminjam;
  } | null>(null);

  const fetchPeminjam = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/peminjam?${params.toString()}`);
      const data = await res.json().catch(() => ({}));
      setPeminjam(data.peminjam || []);
      setSummary(data.summary || { totalAll: 0, totalActive: 0, totalSuspended: 0, totalBorrowAll: 0 });
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    const delay = setTimeout(() => fetchPeminjam(), search ? 400 : 0);
    return () => clearTimeout(delay);
  }, [fetchPeminjam, search]);

  const handleToggleActive = async (p: Peminjam, newActive: boolean) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/peminjam/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newActive }),
      });
      if (res.ok) {
        setPeminjam((prev) => prev.map((u) => u.id === p.id ? { ...u, isActive: newActive } : u));
        setSummary((prev) => ({
          ...prev,
          totalActive: newActive ? prev.totalActive + 1 : prev.totalActive - 1,
          totalSuspended: newActive ? prev.totalSuspended - 1 : prev.totalSuspended + 1,
        }));
      }
    } catch {
      // handle silently
    } finally {
      setActionLoading(false);
      setConfirm(null);
    }
  };

  const handleDelete = async (p: Peminjam) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/peminjam/${p.id}`, { method: "DELETE" });
      if (res.ok) {
        setPeminjam((prev) => prev.filter((u) => u.id !== p.id));
        setSummary((prev) => ({
          ...prev,
          totalAll: prev.totalAll - 1,
          totalActive: p.isActive ? prev.totalActive - 1 : prev.totalActive,
          totalSuspended: !p.isActive ? prev.totalSuspended - 1 : prev.totalSuspended,
        }));
      }
    } catch {
      // handle silently
    } finally {
      setActionLoading(false);
      setConfirm(null);
    }
  };

  const summaryCards = [
    { label: "Total Peminjam", value: summary.totalAll, icon: Users, from: "from-indigo-50", to: "to-blue-50", border: "border-indigo-100", iconClass: "bg-indigo-100 text-indigo-600", textClass: "text-indigo-700" },
    { label: "Akun Aktif", value: summary.totalActive, icon: UserCheck, from: "from-emerald-50", to: "to-green-50", border: "border-emerald-100", iconClass: "bg-emerald-100 text-emerald-600", textClass: "text-emerald-700" },
    { label: "Ditangguhkan", value: summary.totalSuspended, icon: UserX, from: "from-red-50", to: "to-rose-50", border: "border-red-100", iconClass: "bg-red-100 text-red-600", textClass: "text-red-700" },
    { label: "Total Peminjaman", value: summary.totalBorrowAll, icon: FileClock, from: "from-amber-50", to: "to-orange-50", border: "border-amber-100", iconClass: "bg-amber-100 text-amber-600", textClass: "text-amber-700" },
  ];

  const STATUS_FILTERS = [
    { value: "", label: "Semua Peminjam" },
    { value: "active", label: "Aktif" },
    { value: "suspended", label: "Ditangguhkan" },
  ];

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <UserCheck size={20} className="text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Kelola Peminjam</h1>
          </div>
          <p className="text-gray-500 mt-1 ml-12">Pantau dan kelola akun pengguna luar yang terdaftar</p>
        </div>
        <button
          onClick={() => { setPage(1); fetchPeminjam(); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryCards.map((card) => (
          <div key={card.label} className={`bg-gradient-to-br ${card.from} ${card.to} border ${card.border} rounded-2xl p-4`}>
            <div className={`p-2 rounded-xl ${card.iconClass} w-fit mb-3`}>
              <card.icon size={18} />
            </div>
            <p className={`text-2xl font-bold ${card.textClass}`}>{card.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari nama, email, atau instansi..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
          />
          {search && (
            <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={15} />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => { setStatusFilter(f.value); setPage(1); }}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                statusFilter === f.value
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
            <Loader2 size={24} className="animate-spin" />
            <span className="text-sm">Memuat data peminjam...</span>
          </div>
        ) : peminjam.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="p-4 bg-gray-50 rounded-2xl">
              <Users size={32} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">Belum ada pengguna peminjam terdaftar</p>
            <p className="text-xs text-gray-400">Pengguna yang mendaftar melalui halaman /register akan muncul di sini</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pengguna</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Instansi</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Terdaftar</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statistik Peminjaman</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {peminjam.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* User */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 ${p.isActive ? "bg-gradient-to-br from-indigo-400 to-blue-500" : "bg-gray-300"}`}>
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{p.name}</p>
                            <p className="text-xs text-gray-400">{p.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Instansi */}
                      <td className="px-5 py-4">
                        {p.instansi ? (
                          <div className="flex items-center gap-1.5">
                            <Building2 size={13} className="text-gray-400 shrink-0" />
                            <span className="text-sm text-gray-600">{p.instansi}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300 italic">—</span>
                        )}
                      </td>

                      {/* Terdaftar */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 whitespace-nowrap">
                          <CalendarDays size={13} />
                          {format(new Date(p.createdAt), "dd MMM yyyy", { locale: idLocale })}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                          p.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}>
                          {p.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {p.isActive ? "Aktif" : "Ditangguhkan"}
                        </span>
                      </td>

                      {/* Borrow Stats */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <p className="text-sm font-bold text-gray-800">{p.borrowStats.total}</p>
                            <p className="text-[10px] text-gray-400">Total</p>
                          </div>
                          <div className="h-8 w-px bg-gray-100" />
                          <div className="flex gap-2.5 text-xs">
                            {p.borrowStats.pending > 0 && (
                              <span className="flex items-center gap-1 text-amber-600">
                                <Clock size={11} />{p.borrowStats.pending}
                              </span>
                            )}
                            {p.borrowStats.approved > 0 && (
                              <span className="flex items-center gap-1 text-emerald-600">
                                <CheckCircle2 size={11} />{p.borrowStats.approved}
                              </span>
                            )}
                            {p.borrowStats.returned > 0 && (
                              <span className="flex items-center gap-1 text-blue-600">
                                <Package size={11} />{p.borrowStats.returned}
                              </span>
                            )}
                            {p.borrowStats.rejected > 0 && (
                              <span className="flex items-center gap-1 text-red-500">
                                <XCircle size={11} />{p.borrowStats.rejected}
                              </span>
                            )}
                            {p.borrowStats.total === 0 && (
                              <span className="text-gray-300 italic text-[11px]">Belum ada</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* Toggle Active */}
                          {p.isActive ? (
                            <button
                              onClick={() => setConfirm({ type: "suspend", target: p })}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-all"
                              title="Tangguhkan akun"
                            >
                              <ShieldOff size={13} />
                              Tangguhkan
                            </button>
                          ) : (
                            <button
                              onClick={() => setConfirm({ type: "activate", target: p })}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-all"
                              title="Aktifkan akun"
                            >
                              <ShieldCheck size={13} />
                              Aktifkan
                            </button>
                          )}
                          {/* Delete (Super Admin only) */}
                          {isSuperAdmin && (
                            <button
                              onClick={() => setConfirm({ type: "delete", target: p })}
                              className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="Hapus akun"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/40">
                <p className="text-xs text-gray-500">Halaman {page} dari {totalPages}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-white transition-all">
                    <ChevronLeft size={15} className="text-gray-600" />
                  </button>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-white transition-all">
                    <ChevronRight size={15} className="text-gray-600" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirm Dialog */}
      {confirm && (
        <ConfirmDialog
          title={
            confirm.type === "suspend" ? "Tangguhkan Akun" :
            confirm.type === "activate" ? "Aktifkan Akun" :
            "Hapus Akun Peminjam"
          }
          message={
            confirm.type === "suspend"
              ? `Akun ${confirm.target.name} akan ditangguhkan dan tidak bisa login. Anda bisa mengaktifkan kembali kapan saja.`
              : confirm.type === "activate"
              ? `Akun ${confirm.target.name} akan diaktifkan kembali dan bisa login.`
              : `Akun ${confirm.target.name} beserta semua riwayat peminjaman akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`
          }
          confirmLabel={
            confirm.type === "suspend" ? "Tangguhkan" :
            confirm.type === "activate" ? "Aktifkan" :
            "Hapus Permanen"
          }
          confirmClass={
            confirm.type === "suspend" ? "bg-amber-500 hover:bg-amber-400 shadow-amber-500/20" :
            confirm.type === "activate" ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20" :
            "bg-red-600 hover:bg-red-500 shadow-red-500/20"
          }
          loading={actionLoading}
          onConfirm={() => {
            if (confirm.type === "delete") {
              handleDelete(confirm.target);
            } else {
              handleToggleActive(confirm.target, confirm.type === "activate");
            }
          }}
          onCancel={() => !actionLoading && setConfirm(null)}
        />
      )}
    </div>
  );
}
