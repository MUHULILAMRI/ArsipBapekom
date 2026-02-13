"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Hash,
  FileText,
  Calendar,
  Building2,
  User,
  Clock,
  Download,
  Trash2,
  Edit3,
  FileArchive,
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface ArchiveDetail {
  id: string;
  archiveNumber: string;
  title: string;
  letterNumber: string;
  date: string;
  division: string;
  description: string | null;
  fileUrl: string;
  fileId: string;
  createdBy: string;
  status: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-gray-50 last:border-0">
      <div className="p-2 bg-gray-50 rounded-xl shrink-0">
        <Icon size={18} className="text-gray-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

const divisionLabels: Record<string, string> = {
  KEUANGAN: "Keuangan",
  PENYELENGGARA: "Penyelenggara",
  TATA_USAHA: "Tata Usaha",
  UMUM: "Umum",
};

const divisionColors: Record<string, string> = {
  KEUANGAN: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENYELENGGARA: "bg-blue-50 text-blue-700 border-blue-200",
  TATA_USAHA: "bg-amber-50 text-amber-700 border-amber-200",
  UMUM: "bg-purple-50 text-purple-700 border-purple-200",
};

export default function ArchiveDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [archive, setArchive] = useState<ArchiveDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/archives/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Arsip tidak ditemukan");
        return res.json();
      })
      .then((data) => setArchive(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus arsip ini?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/archives/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus arsip");
      router.push("/archives");
    } catch (err: any) {
      alert(err.message);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-fade-in-up">
        <Loader2 size={32} className="text-blue-500 animate-spin mb-4" />
        <p className="text-gray-400 text-sm">Memuat detail arsip...</p>
      </div>
    );
  }

  if (error || !archive) {
    return (
      <div className="animate-fade-in-up">
        <div className="flex flex-col items-center justify-center py-32">
          <div className="p-4 bg-red-50 rounded-2xl mb-4">
            <AlertCircle size={32} className="text-red-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Arsip Tidak Ditemukan
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            {error || "Data arsip tidak tersedia"}
          </p>
          <Link
            href="/archives"
            className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Kembali ke Daftar Arsip
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(archive.date).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedCreatedAt = new Date(archive.createdAt).toLocaleDateString(
    "id-ID",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  return (
    <div className="animate-fade-in-up max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/archives"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Daftar Arsip</span>
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 rounded-xl">
              <FileArchive size={22} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                {archive.title}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${
                    divisionColors[archive.division] || "bg-gray-50 text-gray-600 border-gray-200"
                  }`}
                >
                  {divisionLabels[archive.division] || archive.division}
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border font-medium ${
                    archive.status === "AKTIF"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-orange-50 text-orange-700 border-orange-200"
                  }`}
                >
                  {archive.status === "AKTIF" ? (
                    <CheckCircle2 size={12} />
                  ) : (
                    <XCircle size={12} />
                  )}
                  {archive.status === "AKTIF" ? "Aktif" : "Inaktif"}
                </span>
                <span className="text-xs text-gray-400">
                  #{archive.archiveNumber}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={archive.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300"
            >
              <Download size={16} />
              <span>Download</span>
            </a>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <Trash2 size={16} />
              <span>{deleting ? "Menghapus..." : "Hapus"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">
            Informasi Arsip
          </h2>
          <div className="divide-y divide-gray-50">
            <DetailItem
              icon={Hash}
              label="Nomor Arsip"
              value={archive.archiveNumber}
            />
            <DetailItem
              icon={FileText}
              label="Nomor Surat"
              value={archive.letterNumber}
            />
            <DetailItem
              icon={Calendar}
              label="Tanggal Surat"
              value={formattedDate}
            />
            <DetailItem
              icon={Building2}
              label="Divisi"
              value={divisionLabels[archive.division] || archive.division}
            />
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Created by */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Dibuat Oleh
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                {archive.user.name?.charAt(0).toUpperCase() || "?"}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {archive.user.name}
                </p>
                <p className="text-xs text-gray-400">{archive.user.email}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
              <Clock size={14} />
              <span>{formattedCreatedAt}</span>
            </div>
          </div>

          {/* File Info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              File Dokumen
            </h2>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <FileText size={20} className="text-blue-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {archive.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Google Drive
                  </p>
                </div>
              </div>
            </div>
            <a
              href={archive.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <Download size={16} />
              <span>Buka File</span>
            </a>
          </div>
        </div>
      </div>

      {/* Description */}
      {archive.description && (
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">
            Deskripsi
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
            {archive.description}
          </p>
        </div>
      )}
    </div>
  );
}
