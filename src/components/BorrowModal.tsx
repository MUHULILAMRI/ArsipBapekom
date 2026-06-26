"use client";

import { useState } from "react";
import { FileClock, X, Loader2, FileText, CheckCircle } from "lucide-react";

interface Archive {
  id: string;
  archiveNumber: string;
  title: string;
  noBerkas?: string | null;
  indeks?: string | null;
  division: string;
}

interface BorrowModalProps {
  archive: Archive | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const DIVISION_LABELS: Record<string, string> = {
  KEUANGAN: "Keuangan",
  PENYELENGGARA: "Penyelenggara",
  TATA_USAHA: "Tata Usaha",
  UMUM: "Umum",
};

export default function BorrowModal({ archive, isOpen, onClose, onSuccess }: BorrowModalProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen || !archive) return null;

  const archiveLabel =
    archive.noBerkas || archive.indeks || archive.archiveNumber || archive.title;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Alasan peminjaman wajib diisi.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/borrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archiveId: archive.id, reason: reason.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Gagal mengajukan permohonan peminjaman.");
        return;
      }

      setSuccess(true);
      onSuccess?.();
      setTimeout(() => {
        setSuccess(false);
        setReason("");
        onClose();
      }, 1800);
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setReason("");
    setError("");
    setSuccess(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 rounded-xl">
              <FileClock size={20} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Ajukan Peminjaman</h2>
              <p className="text-xs text-gray-500 mt-0.5">Isi alasan peminjaman arsip</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Archive Info */}
        <div className="px-6 pt-4">
          <div className="flex items-start gap-3 p-3.5 bg-blue-50 rounded-xl border border-blue-100">
            <FileText size={18} className="text-blue-500 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-blue-800 truncate">{archiveLabel}</p>
              <p className="text-xs text-blue-500 mt-0.5">{archive.title}</p>
              <span className="mt-1.5 inline-flex px-2 py-0.5 text-[11px] font-medium bg-blue-100 text-blue-700 rounded-md">
                {DIVISION_LABELS[archive.division] || archive.division}
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        {success ? (
          <div className="flex flex-col items-center justify-center py-10 px-6 gap-3">
            <div className="p-3 bg-emerald-100 rounded-full">
              <CheckCircle size={32} className="text-emerald-500" />
            </div>
            <p className="text-sm font-semibold text-emerald-700">Permohonan berhasil diajukan!</p>
            <p className="text-xs text-gray-500 text-center">Admin akan segera memproses permohonan Anda.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4">
            <div className="mb-4">
              <label htmlFor="borrow-reason" className="block text-sm font-medium text-gray-700 mb-1.5">
                Alasan Peminjaman <span className="text-red-500">*</span>
              </label>
              <textarea
                id="borrow-reason"
                value={reason}
                onChange={(e) => { setReason(e.target.value); setError(""); }}
                rows={4}
                disabled={loading}
                placeholder="Contoh: Diperlukan untuk keperluan audit internal divisi keuangan..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all resize-none disabled:opacity-60"
              />
              {error && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <X size={12} /> {error}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading || !reason.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold hover:from-indigo-500 hover:to-blue-500 transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Mengajukan...
                  </>
                ) : (
                  <>
                    <FileClock size={16} />
                    Ajukan Permohonan
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
