"use client";

import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plus, Archive, FileText, CheckCircle2, XCircle, FolderOpen, Download } from "lucide-react";
import ArchiveTable from "../../../components/ArchiveTable";
import ConfirmModal from "../../../components/ConfirmModal";
import { ArchiveTableSkeleton } from "../../../components/Skeletons";

interface Archive {
  id: string;
  archiveNumber: string;
  title: string;
  letterNumber: string;
  date: string;
  division: string;
  status?: string;
  description: string | null;
  fileUrl: string;
  createdAt: string;
  user?: { name: string; email: string };
}

export default function ArchivesPage() {
  return (
    <Suspense
      fallback={<ArchiveTableSkeleton />}
    >
      <ArchivesContent />
    </Suspense>
  );
}

function ArchivesContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [archives, setArchives] = useState<Archive[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const urlStatus = searchParams.get("status");
  const userRole = (session?.user as any)?.role;
  const canDelete = userRole === "SUPER_ADMIN" || userRole === "ADMIN";

  useEffect(() => {
    if (urlStatus === "AKTIF" || urlStatus === "INAKTIF") {
      setActiveTab(urlStatus);
    }
  }, [urlStatus]);

  useEffect(() => {
    fetchArchives();
  }, []);

  const fetchArchives = async () => {
    try {
      const res = await fetch("/api/archives?limit=200");
      const data = await res.json();
      setArchives(data.archives || []);
    } catch (error) {
      console.error("Failed to fetch archives:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArchives = activeTab === "ALL"
    ? archives
    : archives.filter((a) => a.status === activeTab);

  const activeCount = archives.filter((a) => a.status === "AKTIF").length;
  const inactiveCount = archives.filter((a) => a.status === "INAKTIF").length;

  const handleDelete = (id: string) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/archives/${deleteTarget}`, { method: "DELETE" });
      if (res.ok) {
        setArchives((prev) => prev.filter((a) => a.id !== deleteTarget));
      }
    } catch (error) {
      console.error("Failed to delete:", error);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleExport = (format: "csv" | "json") => {
    const params = new URLSearchParams();
    params.set("format", format);
    if (activeTab !== "ALL") params.set("status", activeTab);
    window.open(`/api/archives/export?${params.toString()}`, "_blank");
  };

  if (loading) {
    return <ArchiveTableSkeleton />;
  }

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-blue-100 rounded-xl">
              <FileText size={20} className="text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Archive List
            </h1>
          </div>
          <p className="text-gray-500 mt-1 ml-12">
            Manage all letters and document archives
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setExportOpen(!exportOpen)}
              onBlur={() => setTimeout(() => setExportOpen(false), 150)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"
            >
              <Download size={16} />
              Export
            </button>
            {exportOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 w-40 z-20 animate-scale-in">
                <button
                  onMouseDown={() => handleExport("csv")}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  📊 Export CSV
                </button>
                <button
                  onMouseDown={() => handleExport("json")}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  📋 Export JSON
                </button>
              </div>
            )}
          </div>
          <Link
            href="/archives/browse"
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"
          >
            <FolderOpen size={18} />
            Browse
          </Link>
          <Link
            href="/archives/create"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
          >
            <Plus size={18} />
            Add Archive
          </Link>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === "ALL"
              ? "bg-blue-600 text-white shadow-md shadow-blue-200"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          <Archive size={14} />
          All
          <span className={`text-xs px-1.5 py-0.5 rounded-md ${activeTab === "ALL" ? "bg-white/20" : "bg-gray-100"}`}>
            {archives.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("AKTIF")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === "AKTIF"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          <CheckCircle2 size={14} />
          Active
          <span className={`text-xs px-1.5 py-0.5 rounded-md ${activeTab === "AKTIF" ? "bg-white/20" : "bg-emerald-50 text-emerald-700"}`}>
            {activeCount}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("INAKTIF")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === "INAKTIF"
              ? "bg-orange-600 text-white shadow-md shadow-orange-200"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          <XCircle size={14} />
          Inactive
          <span className={`text-xs px-1.5 py-0.5 rounded-md ${activeTab === "INAKTIF" ? "bg-white/20" : "bg-orange-50 text-orange-700"}`}>
            {inactiveCount}
          </span>
        </button>
      </div>

      <ArchiveTable
        data={filteredArchives}
        onDelete={handleDelete}
        canDelete={canDelete}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Archive"
        message="Are you sure you want to delete this archive? This action cannot be undone and the associated file will be removed from storage."
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => !deleting && setDeleteTarget(null)}
      />
    </div>
  );
}
