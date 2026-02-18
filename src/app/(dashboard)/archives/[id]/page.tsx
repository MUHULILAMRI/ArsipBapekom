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
  Layers,
  Tag,
  BookOpen,
  Box,
  Copy,
} from "lucide-react";

interface ArchiveDetail {
  id: string;
  archiveNumber: string;
  title: string;
  letterNumber: string;
  date: string;
  division: string;
  description: string | null;
  fileUrl: string | null;
  fileId: string | null;
  createdBy: string;
  status: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  // Arsip Aktif fields
  noBerkas?: string | null;
  noUrut?: string | null;
  kode?: string | null;
  indexPekerjaan?: string | null;
  uraianMasalah?: string | null;
  tahun?: string | null;
  jumlahBerkas?: string | null;
  keteranganAsliCopy?: string | null;
  keteranganBox?: string | null;
  // Arsip Inaktif fields
  noItem?: string | null;
  kodeKlasifikasi?: string | null;
  indeks?: string | null;
  uraianInformasi?: string | null;
  kurunWaktu?: string | null;
  keteranganSKKAAD?: string | null;
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
  KEUANGAN: "Finance",
  PENYELENGGARA: "Operations",
  TATA_USAHA: "Administration",
  UMUM: "General",
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
        if (!res.ok) throw new Error("Archive not found");
        return res.json();
      })
      .then((data) => setArchive(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this archive?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/archives/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete archive");
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
        <p className="text-gray-400 text-sm">Loading archive details...</p>
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
            Archive Not Found
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            {error || "Archive data is not available"}
          </p>
          <Link
            href="/archives"
            className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Back to Archive List
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(archive.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedCreatedAt = new Date(archive.createdAt).toLocaleDateString(
    "en-US",
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
          <span>Back to Archive List</span>
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
                  {archive.status === "AKTIF" ? "Active" : "Inactive"}
                </span>
                <span className="text-xs text-gray-400">
                  #{archive.archiveNumber}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/archives/${archive.id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-medium hover:from-amber-600 hover:to-orange-600 transition-all shadow-md shadow-amber-200 hover:shadow-lg hover:shadow-amber-300"
            >
              <Edit3 size={16} />
              <span>Edit</span>
            </Link>
            {archive.fileUrl && (
              <a
                href={archive.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300"
              >
                <Download size={16} />
                <span>Download</span>
              </a>
            )}
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <Trash2 size={16} />
              <span>{deleting ? "Deleting..." : "Delete"}</span>
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
            {archive.status === "AKTIF" && archive.noBerkas ? (
              <>
                <DetailItem
                  icon={Hash}
                  label="No. Berkas"
                  value={archive.noBerkas}
                />
                {archive.noUrut && (
                  <DetailItem
                    icon={Layers}
                    label="No. Urut"
                    value={archive.noUrut}
                  />
                )}
                {archive.kode && (
                  <DetailItem
                    icon={Tag}
                    label="Kode"
                    value={archive.kode}
                  />
                )}
                {archive.indexPekerjaan && (
                  <DetailItem
                    icon={BookOpen}
                    label="Index / Pekerjaan"
                    value={archive.indexPekerjaan}
                  />
                )}
                {archive.uraianMasalah && (
                  <DetailItem
                    icon={FileText}
                    label="Uraian Masalah / Kegiatan"
                    value={archive.uraianMasalah}
                  />
                )}
                {archive.tahun && (
                  <DetailItem
                    icon={Calendar}
                    label="Tahun"
                    value={archive.tahun}
                  />
                )}
                {archive.jumlahBerkas && (
                  <DetailItem
                    icon={Layers}
                    label="Jumlah Berkas (ML)"
                    value={archive.jumlahBerkas}
                  />
                )}
                {archive.keteranganAsliCopy && (
                  <DetailItem
                    icon={Copy}
                    label="Keterangan: Asli/Copy"
                    value={archive.keteranganAsliCopy}
                  />
                )}
                {archive.keteranganBox && (
                  <DetailItem
                    icon={Box}
                    label="Keterangan: Box"
                    value={archive.keteranganBox}
                  />
                )}
                <DetailItem
                  icon={Building2}
                  label="Divisi"
                  value={divisionLabels[archive.division] || archive.division}
                />
              </>
            ) : archive.status === "INAKTIF" && archive.noBerkas ? (
              <>
                <DetailItem
                  icon={Hash}
                  label="Nomor Berkas"
                  value={archive.noBerkas}
                />
                {archive.noItem && (
                  <DetailItem
                    icon={Layers}
                    label="No. Item"
                    value={archive.noItem}
                  />
                )}
                {archive.kodeKlasifikasi && (
                  <DetailItem
                    icon={Tag}
                    label="Kode Klasifikasi"
                    value={archive.kodeKlasifikasi}
                  />
                )}
                {archive.indeks && (
                  <DetailItem
                    icon={BookOpen}
                    label="Indeks"
                    value={archive.indeks}
                  />
                )}
                {archive.uraianInformasi && (
                  <DetailItem
                    icon={FileText}
                    label="Uraian Informasi"
                    value={archive.uraianInformasi}
                  />
                )}
                {archive.kurunWaktu && (
                  <DetailItem
                    icon={Calendar}
                    label="Kurun Waktu"
                    value={archive.kurunWaktu}
                  />
                )}
                {archive.jumlahBerkas && (
                  <DetailItem
                    icon={Layers}
                    label="Jumlah Berkas"
                    value={archive.jumlahBerkas}
                  />
                )}
                {archive.keteranganAsliCopy && (
                  <DetailItem
                    icon={Copy}
                    label="Keterangan: Asli/Kopi"
                    value={archive.keteranganAsliCopy}
                  />
                )}
                {archive.keteranganBox && (
                  <DetailItem
                    icon={Box}
                    label="Keterangan: Box"
                    value={archive.keteranganBox}
                  />
                )}
                {archive.keteranganSKKAAD && (
                  <DetailItem
                    icon={FileText}
                    label="Keterangan: SKKAAD"
                    value={archive.keteranganSKKAAD}
                  />
                )}
                <DetailItem
                  icon={Building2}
                  label="Divisi"
                  value={divisionLabels[archive.division] || archive.division}
                />
              </>
            ) : (
              <>
                <DetailItem
                  icon={Hash}
                  label="No. Arsip"
                  value={archive.archiveNumber}
                />
                <DetailItem
                  icon={FileText}
                  label="No. Surat"
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
              </>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Created by */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Created By
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
          {archive.fileUrl ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">
                Document File
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
                <span>Open File</span>
              </a>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">
                Document File
              </h2>
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <FileText size={20} className="text-gray-300" />
                </div>
                <p className="text-sm text-gray-400">Tidak ada file</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {archive.description && (
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">
            Description
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
            {archive.description}
          </p>
        </div>
      )}
    </div>
  );
}
