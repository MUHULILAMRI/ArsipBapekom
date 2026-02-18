"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Save,
  Edit3,
} from "lucide-react";

interface ArchiveData {
  id: string;
  archiveNumber: string;
  title: string;
  letterNumber: string;
  date: string;
  division: string;
  status: string;
  description: string | null;
  fileUrl: string;
  fileId: string;
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

const DIVISIONS = [
  { value: "KEUANGAN", label: "Keuangan" },
  { value: "PENYELENGGARA", label: "Penyelenggara" },
  { value: "TATA_USAHA", label: "Tata Usaha" },
  { value: "UMUM", label: "Umum" },
];

export default function EditArchivePage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");

  const [form, setForm] = useState({
    archiveNumber: "",
    title: "",
    letterNumber: "",
    date: "",
    division: "",
    status: "AKTIF",
    description: "",
    // Arsip Aktif fields
    noBerkas: "",
    noUrut: "",
    kode: "",
    indexPekerjaan: "",
    uraianMasalah: "",
    tahun: "",
    jumlahBerkas: "",
    keteranganAsliCopy: "",
    keteranganBox: "",
    // Arsip Inaktif fields
    noItem: "",
    kodeKlasifikasi: "",
    indeks: "",
    uraianInformasi: "",
    kurunWaktu: "",
    keteranganSKKAAD: "",
  });

  const isAktif = form.status === "AKTIF";

  useEffect(() => {
    fetch(`/api/archives/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Arsip tidak ditemukan");
        return res.json();
      })
      .then((data: ArchiveData) => {
        setForm({
          archiveNumber: data.archiveNumber,
          title: data.title,
          letterNumber: data.letterNumber,
          date: data.date ? new Date(data.date).toISOString().split("T")[0] : "",
          division: data.division,
          status: data.status || "AKTIF",
          description: data.description || "",
          // Arsip Aktif fields
          noBerkas: data.noBerkas || "",
          noUrut: data.noUrut || "",
          kode: data.kode || "",
          indexPekerjaan: data.indexPekerjaan || "",
          uraianMasalah: data.uraianMasalah || "",
          tahun: data.tahun || "",
          jumlahBerkas: data.jumlahBerkas || "",
          keteranganAsliCopy: data.keteranganAsliCopy || "",
          keteranganBox: data.keteranganBox || "",
          // Arsip Inaktif fields
          noItem: data.noItem || "",
          kodeKlasifikasi: data.kodeKlasifikasi || "",
          indeks: data.indeks || "",
          uraianInformasi: data.uraianInformasi || "",
          kurunWaktu: data.kurunWaktu || "",
          keteranganSKKAAD: data.keteranganSKKAAD || "",
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError("");

    try {
      const submitData: any = {
        division: form.division,
        status: form.status,
      };

      if (isAktif) {
        submitData.noBerkas = form.noBerkas;
        submitData.noUrut = form.noUrut;
        submitData.kode = form.kode;
        submitData.indexPekerjaan = form.indexPekerjaan;
        submitData.uraianMasalah = form.uraianMasalah;
        submitData.tahun = form.tahun;
        submitData.jumlahBerkas = form.jumlahBerkas;
        submitData.keteranganAsliCopy = form.keteranganAsliCopy;
        submitData.keteranganBox = form.keteranganBox;
        // Set legacy fields
        submitData.archiveNumber = form.noBerkas || "-";
        submitData.title = form.indexPekerjaan || form.uraianMasalah || "-";
        submitData.letterNumber = form.kode || "-";
        submitData.date = form.tahun ? `${form.tahun}-01-01` : form.date;
      } else {
        submitData.noBerkas = form.noBerkas;
        submitData.noItem = form.noItem;
        submitData.kodeKlasifikasi = form.kodeKlasifikasi;
        submitData.indeks = form.indeks;
        submitData.uraianInformasi = form.uraianInformasi;
        submitData.kurunWaktu = form.kurunWaktu;
        submitData.jumlahBerkas = form.jumlahBerkas;
        submitData.keteranganAsliCopy = form.keteranganAsliCopy;
        submitData.keteranganBox = form.keteranganBox;
        submitData.keteranganSKKAAD = form.keteranganSKKAAD;
        // Set legacy fields
        submitData.archiveNumber = form.noBerkas || "-";
        submitData.title = form.indeks || form.uraianInformasi || "-";
        submitData.letterNumber = form.kodeKlasifikasi || "-";
        submitData.date = form.kurunWaktu ? `${form.kurunWaktu.split('-')[0]}-01-01` : form.date;
      }

      const res = await fetch(`/api/archives/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Gagal menyimpan perubahan");
      }

      router.push(`/archives/${id}`);
      router.refresh();
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-fade-in-up">
        <Loader2 size={32} className="text-blue-500 animate-spin mb-4" />
        <p className="text-gray-400 text-sm">Loading archive data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-fade-in-up">
        <div className="flex flex-col items-center justify-center py-32">
          <div className="p-4 bg-red-50 rounded-2xl mb-4">
            <AlertCircle size={32} className="text-red-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Archive Not Found
          </h2>
          <p className="text-gray-400 text-sm mb-6">{error}</p>
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

  return (
    <div className="animate-fade-in-up max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/archives/${id}`}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          <span>Back to Details</span>
        </Link>

        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-amber-100 rounded-xl">
            <Edit3 size={20} className="text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Edit Arsip
          </h1>
        </div>
        <p className="text-gray-500 mt-1 ml-12">
          Edit informasi arsip yang sudah ada
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8">
          {saveError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center gap-3 animate-fade-in-up">
              <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0" />
              {saveError}
            </div>
          )}

          {/* Category & Division - always shown first */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kategori Status */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                Kategori Arsip <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white text-sm transition-all"
              >
                <option value="AKTIF">Arsip Aktif</option>
                <option value="INAKTIF">Arsip Inaktif</option>
              </select>
            </div>

            {/* Divisi */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                Divisi <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={form.division}
                onChange={(e) => setForm({ ...form, division: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white text-sm transition-all"
              >
                <option value="">Pilih Divisi</option>
                {DIVISIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Conditional Fields based on Status */}
          {isAktif ? (
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                Data Arsip Aktif
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* No Berkas */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    No. Berkas <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.noBerkas}
                    onChange={(e) => setForm({ ...form, noBerkas: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white text-sm transition-all"
                    placeholder="Contoh: 001"
                  />
                </div>

                {/* No Urut */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    No. Urut <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.noUrut}
                    onChange={(e) => setForm({ ...form, noUrut: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white text-sm transition-all"
                    placeholder="Contoh: 1"
                  />
                </div>

                {/* Kode */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    Kode <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.kode}
                    onChange={(e) => setForm({ ...form, kode: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white text-sm transition-all"
                    placeholder="Contoh: KU.01.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Index / Pekerjaan */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    Index / Pekerjaan <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.indexPekerjaan}
                    onChange={(e) => setForm({ ...form, indexPekerjaan: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white text-sm transition-all"
                    placeholder="Contoh: Laporan Keuangan"
                  />
                </div>

                {/* Tahun */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    Tahun <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.tahun}
                    onChange={(e) => setForm({ ...form, tahun: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white text-sm transition-all"
                    placeholder="Contoh: 2026"
                  />
                </div>
              </div>

              {/* Uraian Masalah / Kegiatan */}
              <div className="space-y-1.5 mt-6">
                <label className="block text-sm font-semibold text-gray-700">
                  Uraian Masalah / Kegiatan <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  value={form.uraianMasalah}
                  onChange={(e) => setForm({ ...form, uraianMasalah: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white text-sm resize-none transition-all"
                  placeholder="Uraian masalah atau kegiatan arsip"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                {/* ML Berkas (Jumlah) */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    Jumlah Berkas (ML)
                  </label>
                  <input
                    type="text"
                    value={form.jumlahBerkas}
                    onChange={(e) => setForm({ ...form, jumlahBerkas: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white text-sm transition-all"
                    placeholder="Contoh: 5"
                  />
                </div>

                {/* Keterangan: Asli/Copy */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    Keterangan: Asli/Copy
                  </label>
                  <select
                    value={form.keteranganAsliCopy}
                    onChange={(e) => setForm({ ...form, keteranganAsliCopy: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white text-sm transition-all"
                  >
                    <option value="">Pilih</option>
                    <option value="ASLI">Asli</option>
                    <option value="COPY">Copy</option>
                  </select>
                </div>

                {/* Keterangan: Box */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    Keterangan: Box
                  </label>
                  <input
                    type="text"
                    value={form.keteranganBox}
                    onChange={(e) => setForm({ ...form, keteranganBox: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white text-sm transition-all"
                    placeholder="Contoh: Box 1"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                Data Arsip Inaktif
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Nomor Berkas */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    Nomor Berkas <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.noBerkas}
                    onChange={(e) => setForm({ ...form, noBerkas: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white text-sm transition-all"
                    placeholder="Contoh: 001"
                  />
                </div>

                {/* No. Item */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    No. Item <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.noItem}
                    onChange={(e) => setForm({ ...form, noItem: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white text-sm transition-all"
                    placeholder="Contoh: 1"
                  />
                </div>

                {/* Kode Klasifikasi */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    Kode Klasifikasi <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.kodeKlasifikasi}
                    onChange={(e) => setForm({ ...form, kodeKlasifikasi: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white text-sm transition-all"
                    placeholder="Contoh: KU.01.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Indeks */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    Indeks <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.indeks}
                    onChange={(e) => setForm({ ...form, indeks: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white text-sm transition-all"
                    placeholder="Contoh: Laporan Keuangan"
                  />
                </div>

                {/* Kurun Waktu */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    Kurun Waktu <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.kurunWaktu}
                    onChange={(e) => setForm({ ...form, kurunWaktu: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white text-sm transition-all"
                    placeholder="Contoh: 2020-2025"
                  />
                </div>
              </div>

              {/* Uraian Informasi */}
              <div className="space-y-1.5 mt-6">
                <label className="block text-sm font-semibold text-gray-700">
                  Uraian Informasi <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  value={form.uraianInformasi}
                  onChange={(e) => setForm({ ...form, uraianInformasi: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white text-sm resize-none transition-all"
                  placeholder="Uraian informasi arsip"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
                {/* Jumlah Berkas */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    Jumlah Berkas
                  </label>
                  <input
                    type="text"
                    value={form.jumlahBerkas}
                    onChange={(e) => setForm({ ...form, jumlahBerkas: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white text-sm transition-all"
                    placeholder="Contoh: 5"
                  />
                </div>

                {/* Keterangan: Asli/Kopi */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    Keterangan: Asli/Kopi
                  </label>
                  <select
                    value={form.keteranganAsliCopy}
                    onChange={(e) => setForm({ ...form, keteranganAsliCopy: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white text-sm transition-all"
                  >
                    <option value="">Pilih</option>
                    <option value="ASLI">Asli</option>
                    <option value="KOPI">Kopi</option>
                  </select>
                </div>

                {/* Keterangan: Box */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    Keterangan: Box
                  </label>
                  <input
                    type="text"
                    value={form.keteranganBox}
                    onChange={(e) => setForm({ ...form, keteranganBox: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white text-sm transition-all"
                    placeholder="Contoh: Box 1"
                  />
                </div>

                {/* Keterangan: SKKAAD */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    Keterangan: SKKAAD
                  </label>
                  <input
                    type="text"
                    value={form.keteranganSKKAAD}
                    onChange={(e) => setForm({ ...form, keteranganSKKAAD: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white text-sm transition-all"
                    placeholder="Contoh: SKKAAD-001"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Link
              href={`/archives/${id}`}
              className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-semibold hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98]"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
