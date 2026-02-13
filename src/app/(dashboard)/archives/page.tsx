"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Plus, Archive, FileText } from "lucide-react";
import ArchiveTable from "../../../components/ArchiveTable";

interface Archive {
  id: string;
  archiveNumber: string;
  title: string;
  letterNumber: string;
  date: string;
  division: string;
  description: string | null;
  fileUrl: string;
  createdAt: string;
  user?: { name: string; email: string };
}

export default function ArchivesPage() {
  const { data: session } = useSession();
  const [archives, setArchives] = useState<Archive[]>([]);
  const [loading, setLoading] = useState(true);

  const userRole = (session?.user as any)?.role;
  const canDelete = userRole === "SUPER_ADMIN" || userRole === "ADMIN";

  useEffect(() => {
    fetchArchives();
  }, []);

  const fetchArchives = async () => {
    try {
      const res = await fetch("/api/archives?limit=100");
      const data = await res.json();
      setArchives(data.archives || []);
    } catch (error) {
      console.error("Failed to fetch archives:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus arsip ini?")) return;

    try {
      const res = await fetch(`/api/archives/${id}`, { method: "DELETE" });
      if (res.ok) {
        setArchives((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Memuat data arsip...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-blue-100 rounded-xl">
              <FileText size={20} className="text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Daftar Arsip
            </h1>
          </div>
          <p className="text-gray-500 mt-1 ml-12">
            Kelola semua arsip surat dan dokumen
          </p>
        </div>
        <Link
          href="/archives/create"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
        >
          <Plus size={18} />
          Tambah Arsip
        </Link>
      </div>

      <ArchiveTable
        data={archives}
        onDelete={handleDelete}
        canDelete={canDelete}
      />
    </div>
  );
}
