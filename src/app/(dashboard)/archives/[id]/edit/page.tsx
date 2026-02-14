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
}

const DIVISIONS = [
  { value: "KEUANGAN", label: "Finance" },
  { value: "PENYELENGGARA", label: "Operations" },
  { value: "TATA_USAHA", label: "Administration" },
  { value: "UMUM", label: "General" },
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
  });

  useEffect(() => {
    fetch(`/api/archives/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Archive not found");
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
      const res = await fetch(`/api/archives/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          date: form.date,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save changes");
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
            Edit Archive
          </h1>
        </div>
        <p className="text-gray-500 mt-1 ml-12">
          Edit existing archive information
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nomor Arsip */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                Archive No. <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={form.archiveNumber}
                onChange={(e) =>
                  setForm({ ...form, archiveNumber: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white text-sm transition-all"
                placeholder="e.g. ARS-2026-001"
              />
            </div>

            {/* Judul */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white text-sm transition-all"
                placeholder="Archive title"
              />
            </div>

            {/* Nomor Surat */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                Letter No. <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={form.letterNumber}
                onChange={(e) =>
                  setForm({ ...form, letterNumber: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white text-sm transition-all"
                placeholder="e.g. 001/BPK/2026"
              />
            </div>

            {/* Tanggal */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                Date <span className="text-red-400">*</span>
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
                Division <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={form.division}
                onChange={(e) => setForm({ ...form, division: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white text-sm transition-all"
              >
                <option value="">Select Division</option>
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
                Category <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white text-sm transition-all"
              >
                <option value="AKTIF">Active Archive</option>
                <option value="INAKTIF">Inactive Archive</option>
              </select>
            </div>
          </div>

          {/* Deskripsi */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white text-sm resize-none transition-all"
              placeholder="Archive description (optional)"
            />
          </div>

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
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
