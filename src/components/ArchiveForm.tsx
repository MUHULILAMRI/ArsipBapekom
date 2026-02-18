"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, FileUp, X, CheckCircle } from "lucide-react";

interface ArchiveFormProps {
  userDivision?: string;
  userRole?: string;
}

const DIVISIONS = [
  { value: "KEUANGAN", label: "Keuangan" },
  { value: "PENYELENGGARA", label: "Penyelenggara" },
  { value: "TATA_USAHA", label: "Tata Usaha" },
  { value: "UMUM", label: "Umum" },
];

export default function ArchiveForm({ userDivision, userRole }: ArchiveFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    // Common fields
    division: userRole === "USER" ? (userDivision || "") : "",
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
    noBerkasInaktif: "",
    noItem: "",
    kodeKlasifikasi: "",
    indeks: "",
    uraianInformasi: "",
    kurunWaktu: "",
    jumlahBerkasInaktif: "",
    keteranganAsliKopi: "",
    keteranganBoxInaktif: "",
    keteranganSKKAAD: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const isAktif = form.status === "AKTIF";

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let fileId = null;
      let fileUrl = null;

      // Upload file only if provided
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("division", form.division);

        // Send year for folder organization
        if (isAktif && form.tahun) {
          formData.append("year", form.tahun);
        } else if (!isAktif && form.kurunWaktu) {
          formData.append("year", form.kurunWaktu);
        }

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.json().catch(() => ({}));
          throw new Error(err.error || "Upload gagal");
        }

        const uploadData = await uploadRes.json();
        fileId = uploadData.fileId;
        fileUrl = uploadData.fileUrl;
      }

      // Build the archive data based on status
      const archiveData: any = {
        division: form.division,
        status: form.status,
        ...(fileId && { fileId }),
        ...(fileUrl && { fileUrl }),
      };

      if (isAktif) {
        // Arsip Aktif fields
        archiveData.noBerkas = form.noBerkas;
        archiveData.noUrut = form.noUrut;
        archiveData.kode = form.kode;
        archiveData.indexPekerjaan = form.indexPekerjaan;
        archiveData.uraianMasalah = form.uraianMasalah;
        archiveData.tahun = form.tahun;
        archiveData.jumlahBerkas = form.jumlahBerkas;
        archiveData.keteranganAsliCopy = form.keteranganAsliCopy;
        archiveData.keteranganBox = form.keteranganBox;
        // Set defaults for required legacy fields
        archiveData.archiveNumber = form.noBerkas || "-";
        archiveData.title = form.indexPekerjaan || form.uraianMasalah || "-";
        archiveData.letterNumber = form.kode || "-";
        archiveData.date = form.tahun ? `${form.tahun}-01-01` : new Date().toISOString();
      } else {
        // Arsip Inaktif fields
        archiveData.noBerkas = form.noBerkasInaktif;
        archiveData.noItem = form.noItem;
        archiveData.kodeKlasifikasi = form.kodeKlasifikasi;
        archiveData.indeks = form.indeks;
        archiveData.uraianInformasi = form.uraianInformasi;
        archiveData.kurunWaktu = form.kurunWaktu;
        archiveData.jumlahBerkas = form.jumlahBerkasInaktif;
        archiveData.keteranganAsliCopy = form.keteranganAsliKopi;
        archiveData.keteranganBox = form.keteranganBoxInaktif;
        archiveData.keteranganSKKAAD = form.keteranganSKKAAD;
        // Set defaults for required legacy fields
        archiveData.archiveNumber = form.noBerkasInaktif || "-";
        archiveData.title = form.indeks || form.uraianInformasi || "-";
        archiveData.letterNumber = form.kodeKlasifikasi || "-";
        archiveData.date = form.kurunWaktu ? `${form.kurunWaktu.split('-')[0]}-01-01` : new Date().toISOString();
      }

      const archiveRes = await fetch("/api/archives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(archiveData),
      });

      if (!archiveRes.ok) {
        const err = await archiveRes.json().catch(() => ({}));
        throw new Error(err.error || "Gagal menyimpan arsip");
      }

      router.push("/archives");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const canSelectDivision = userRole === "SUPER_ADMIN" || userRole === "ADMIN";

  const inputClass =
    "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white text-sm transition-all";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center gap-3 animate-fade-in-up">
          <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0" />
          {error}
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
            className={inputClass}
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
            disabled={!canSelectDivision}
            className={`${inputClass} disabled:bg-gray-100 disabled:text-gray-500`}
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
        <>
          {/* ===== ARSIP AKTIF FIELDS ===== */}
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
                  className={inputClass}
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
                  className={inputClass}
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
                  className={inputClass}
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
                  className={inputClass}
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
                  className={inputClass}
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
                className={`${inputClass} resize-none`}
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
                  className={inputClass}
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
                  className={inputClass}
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
                  className={inputClass}
                  placeholder="Contoh: Box 1"
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* ===== ARSIP INAKTIF FIELDS ===== */}
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
                  value={form.noBerkasInaktif}
                  onChange={(e) => setForm({ ...form, noBerkasInaktif: e.target.value })}
                  className={inputClass}
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
                  className={inputClass}
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
                  className={inputClass}
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
                  className={inputClass}
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
                  className={inputClass}
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
                className={`${inputClass} resize-none`}
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
                  value={form.jumlahBerkasInaktif}
                  onChange={(e) => setForm({ ...form, jumlahBerkasInaktif: e.target.value })}
                  className={inputClass}
                  placeholder="Contoh: 5"
                />
              </div>

              {/* Keterangan: Asli/Kopi */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                  Keterangan: Asli/Kopi
                </label>
                <select
                  value={form.keteranganAsliKopi}
                  onChange={(e) => setForm({ ...form, keteranganAsliKopi: e.target.value })}
                  className={inputClass}
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
                  value={form.keteranganBoxInaktif}
                  onChange={(e) => setForm({ ...form, keteranganBoxInaktif: e.target.value })}
                  className={inputClass}
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
                  className={inputClass}
                  placeholder="Contoh: SKKAAD-001"
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Unggah File - Drag & Drop */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">
          Upload File <span className="text-gray-400 font-normal">(opsional)</span>
        </label>
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
            dragActive
              ? "border-blue-400 bg-blue-50/50"
              : file
              ? "border-emerald-300 bg-emerald-50/30"
              : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/20"
          }`}
        >
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {file ? (
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-3">
                <CheckCircle size={28} className="text-emerald-600" />
              </div>
              <p className="text-sm font-semibold text-gray-800">{file.name}</p>
              <p className="text-xs text-gray-400 mt-1">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="mt-3 text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <X size={12} /> Hapus file
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-3">
                <FileUp size={28} className="text-blue-500" />
              </div>
              <p className="text-sm font-medium text-gray-600">
                Drag & drop file di sini, atau{" "}
                <span className="text-blue-600 font-semibold">klik untuk memilih</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PDF, DOC, XLSX, JPG, PNG (Maks. 10MB)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Upload size={16} />
              Simpan Arsip
            </>
          )}
        </button>
      </div>
    </form>
  );
}
