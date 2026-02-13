"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Plus } from "lucide-react";
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Arsip</h1>
          <p className="text-gray-500 mt-1">
            Kelola semua arsip surat dan dokumen
          </p>
        </div>
        <Link
          href="/archives/create"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
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
