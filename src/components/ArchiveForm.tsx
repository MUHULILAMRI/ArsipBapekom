"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, FileUp, X, CheckCircle } from "lucide-react";

interface ArchiveFormProps {
  userDivision?: string;
  userRole?: string;
}

const DIVISIONS = [
  { value: "KEUANGAN", label: "Divisi Keuangan" },
  { value: "PENYELENGGARA", label: "Divisi Penyelenggara" },
  { value: "TATA_USAHA", label: "Divisi Tata Usaha" },
  { value: "UMUM", label: "Divisi Umum" },
];

export default function ArchiveForm({ userDivision, userRole }: ArchiveFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    archiveNumber: "",
    title: "",
    letterNumber: "",
    date: "",
    division: userRole === "USER" ? (userDivision || "") : "",
    status: "AKTIF",
    description: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

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
      if (!file) {
        setError("File wajib diupload");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("division", form.division);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.error || "Upload gagal");
      }

      const { fileId, fileUrl } = await uploadRes.json();

      const archiveRes = await fetch("/api/archives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          fileId,
          fileUrl,
        }),
      });

      if (!archiveRes.ok) {
        const err = await archiveRes.json();
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

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center gap-3 animate-fade-in-up">
          <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nomor Arsip */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">
            Nomor Arsip <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            value={form.archiveNumber}
            onChange={(e) => setForm({ ...form, archiveNumber: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white text-sm transition-all"
            placeholder="Contoh: ARS-2026-001"
          />
        </div>

        {/* Judul */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">
            Judul <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white text-sm transition-all"
            placeholder="Judul arsip"
          />
        </div>

        {/* Nomor Surat */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">
            Nomor Surat <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            value={form.letterNumber}
            onChange={(e) => setForm({ ...form, letterNumber: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white text-sm transition-all"
            placeholder="Contoh: 001/BPK/2026"
          />
        </div>

        {/* Tanggal */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">
            Tanggal <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white text-sm transition-all"
          />
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
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white text-sm disabled:bg-gray-100 disabled:text-gray-500 transition-all"
          >
            <option value="">Pilih Divisi</option>
            {DIVISIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {/* Kategori Status */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">
            Kategori <span className="text-red-400">*</span>
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
      </div>

      {/* Deskripsi */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">
          Deskripsi
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white text-sm resize-none transition-all"
          placeholder="Deskripsi arsip (opsional)"
        />
      </div>

      {/* Unggah File - Drag & Drop */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">
          Unggah File <span className="text-red-400">*</span>
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
              Mengunggah...
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
