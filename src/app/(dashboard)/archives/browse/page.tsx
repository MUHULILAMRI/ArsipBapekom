"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Folder,
  FolderOpen,
  FileText,
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Building2,
  Calendar,
  Plus,
  Loader2,
  Home,
  Eye,
  Edit3,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

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

const DIVISION_LABELS: Record<string, string> = {
  KEUANGAN: "Keuangan",
  PENYELENGGARA: "Penyelenggara",
  TATA_USAHA: "Tata Usaha",
  UMUM: "Umum",
};

const DIVISION_COLORS: Record<string, { bg: string; icon: string; border: string }> = {
  KEUANGAN: { bg: "bg-emerald-50", icon: "text-emerald-600", border: "border-emerald-200" },
  PENYELENGGARA: { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-200" },
  TATA_USAHA: { bg: "bg-amber-50", icon: "text-amber-600", border: "border-amber-200" },
  UMUM: { bg: "bg-purple-50", icon: "text-purple-600", border: "border-purple-200" },
};

type BrowseLevel = "root" | "status" | "division" | "year";

export default function BrowseArchivesPage() {
  const { data: session } = useSession();
  const [archives, setArchives] = useState<Archive[]>([]);
  const [loading, setLoading] = useState(true);

  // Navigation state
  const [level, setLevel] = useState<BrowseLevel>("root");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedDivision, setSelectedDivision] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");

  useEffect(() => {
    fetch("/api/archives?limit=500")
      .then((res) => res.json())
      .then((data) => setArchives(data.archives || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Filtered data based on selections
  const statusFiltered = selectedStatus
    ? archives.filter((a) => a.status === selectedStatus)
    : archives;

  const divisionFiltered = selectedDivision
    ? statusFiltered.filter((a) => a.division === selectedDivision)
    : statusFiltered;

  const yearFiltered = selectedYear
    ? divisionFiltered.filter(
        (a) => new Date(a.date).getFullYear().toString() === selectedYear
      )
    : divisionFiltered;

  // Get counts for folder badges
  const getStatusCount = (status: string) =>
    archives.filter((a) => a.status === status).length;

  const getDivisionCount = (division: string) =>
    statusFiltered.filter((a) => a.division === division).length;

  const getYearCount = (year: string) =>
    divisionFiltered.filter(
      (a) => new Date(a.date).getFullYear().toString() === year
    ).length;

  // Get unique years from filtered data
  const availableYears = [
    ...new Set(
      divisionFiltered.map((a) => new Date(a.date).getFullYear().toString())
    ),
  ].sort((a, b) => parseInt(b) - parseInt(a));

  const availableDivisions = [
    ...new Set(statusFiltered.map((a) => a.division)),
  ].sort();

  // Navigation handlers
  const navigateTo = (newLevel: BrowseLevel, value?: string) => {
    switch (newLevel) {
      case "root":
        setLevel("root");
        setSelectedStatus("");
        setSelectedDivision("");
        setSelectedYear("");
        break;
      case "status":
        setLevel("status");
        setSelectedStatus(value || "");
        setSelectedDivision("");
        setSelectedYear("");
        break;
      case "division":
        setLevel("division");
        setSelectedDivision(value || "");
        setSelectedYear("");
        break;
      case "year":
        setLevel("year");
        setSelectedYear(value || "");
        break;
    }
  };

  const goBack = () => {
    switch (level) {
      case "year":
        navigateTo("division", selectedDivision);
        setLevel("status");
        setSelectedDivision("");
        break;
      case "division":
        navigateTo("status", selectedStatus);
        setLevel("root");
        setSelectedStatus("");
        break;
      case "status":
        navigateTo("root");
        break;
    }
  };

  // Breadcrumb
  const breadcrumbs: { label: string; action: () => void }[] = [
    { label: "Arsip", action: () => navigateTo("root") },
  ];
  if (selectedStatus) {
    breadcrumbs.push({
      label: selectedStatus === "AKTIF" ? "Aktif" : "Inaktif",
      action: () => {
        setLevel("status");
        setSelectedDivision("");
        setSelectedYear("");
      },
    });
  }
  if (selectedDivision) {
    breadcrumbs.push({
      label: DIVISION_LABELS[selectedDivision] || selectedDivision,
      action: () => {
        setLevel("division");
        setSelectedYear("");
      },
    });
  }
  if (selectedYear) {
    breadcrumbs.push({
      label: selectedYear,
      action: () => {},
    });
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-fade-in-up">
        <Loader2 size={32} className="text-blue-500 animate-spin mb-4" />
        <p className="text-gray-400 text-sm">Memuat data arsip...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <Folder size={20} className="text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Jelajahi Arsip
            </h1>
          </div>
          <p className="text-gray-500 mt-1 ml-12">
            Telusuri arsip berdasarkan kategori, divisi, dan tahun
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

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 mb-6 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
        <button
          onClick={() => navigateTo("root")}
          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
        >
          <Home size={16} />
        </button>
        {breadcrumbs.map((crumb, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <ChevronRight size={14} className="text-gray-300" />
            <button
              onClick={crumb.action}
              className={`text-sm font-medium px-2 py-1 rounded-lg transition-all ${
                i === breadcrumbs.length - 1
                  ? "text-gray-900 bg-gray-100"
                  : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              {crumb.label}
            </button>
          </div>
        ))}
      </div>

      {/* Back button for non-root levels */}
      {level !== "root" && (
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          Kembali
        </button>
      )}

      {/* Content */}
      {level === "root" && <StatusFolders onSelect={(s) => navigateTo("status", s)} getCount={getStatusCount} />}
      {level === "status" && (
        <DivisionFolders
          divisions={availableDivisions}
          onSelect={(d) => {
            setSelectedDivision(d);
            setLevel("division");
          }}
          getCount={getDivisionCount}
        />
      )}
      {level === "division" && (
        <YearFolders
          years={availableYears}
          onSelect={(y) => {
            setSelectedYear(y);
            setLevel("year");
          }}
          getCount={getYearCount}
        />
      )}
      {level === "year" && <ArchiveList archives={yearFiltered} />}
    </div>
  );
}

// ─── Status Folders (Aktif / Inaktif) ───
function StatusFolders({
  onSelect,
  getCount,
}: {
  onSelect: (status: string) => void;
  getCount: (status: string) => number;
}) {
  const folders = [
    {
      key: "AKTIF",
      label: "Arsip Aktif",
      description: "Dokumen yang masih berlaku dan digunakan",
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-teal-600",
      bgHover: "hover:border-emerald-300 hover:bg-emerald-50/30",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      countBg: "bg-emerald-50 text-emerald-700",
    },
    {
      key: "INAKTIF",
      label: "Arsip Inaktif",
      description: "Dokumen yang sudah tidak aktif atau kadaluarsa",
      icon: XCircle,
      gradient: "from-orange-500 to-amber-600",
      bgHover: "hover:border-orange-300 hover:bg-orange-50/30",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      countBg: "bg-orange-50 text-orange-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {folders.map((folder, index) => {
        const Icon = folder.icon;
        const count = getCount(folder.key);
        return (
          <button
            key={folder.key}
            onClick={() => onSelect(folder.key)}
            className={`group relative flex items-center gap-5 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm text-left transition-all card-hover animate-fade-in-up ${folder.bgHover}`}
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <div className={`p-4 rounded-2xl ${folder.iconBg} group-hover:scale-110 transition-transform`}>
              <FolderOpen size={28} className={folder.iconColor} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-bold text-gray-900">{folder.label}</h3>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${folder.countBg}`}>
                  {count} arsip
                </span>
              </div>
              <p className="text-sm text-gray-400">{folder.description}</p>
            </div>
            <ChevronRight size={20} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
          </button>
        );
      })}
    </div>
  );
}

// ─── Division Folders ───
function DivisionFolders({
  divisions,
  onSelect,
  getCount,
}: {
  divisions: string[];
  onSelect: (division: string) => void;
  getCount: (division: string) => number;
}) {
  const allDivisions = ["KEUANGAN", "PENYELENGGARA", "TATA_USAHA", "UMUM"];
  const displayDivisions = allDivisions.filter(
    (d) => divisions.includes(d) || true
  );

  if (displayDivisions.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Folder size={28} className="text-gray-300" />
        </div>
        <p className="text-gray-400 font-medium">Tidak ada data untuk kategori ini</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {displayDivisions.map((division, index) => {
        const count = getCount(division);
        const colors = DIVISION_COLORS[division] || {
          bg: "bg-gray-50",
          icon: "text-gray-600",
          border: "border-gray-200",
        };
        return (
          <button
            key={division}
            onClick={() => onSelect(division)}
            disabled={count === 0}
            className={`group relative flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm text-center transition-all animate-fade-in-up ${
              count > 0
                ? `card-hover hover:${colors.border}`
                : "opacity-40 cursor-not-allowed"
            }`}
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <div className={`p-4 rounded-2xl ${colors.bg} group-hover:scale-110 transition-transform`}>
              <Building2 size={24} className={colors.icon} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                {DIVISION_LABELS[division]}
              </h3>
              <p className="text-xs text-gray-400 mt-1">{count} arsip</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Year Folders ───
function YearFolders({
  years,
  onSelect,
  getCount,
}: {
  years: string[];
  onSelect: (year: string) => void;
  getCount: (year: string) => number;
}) {
  if (years.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Calendar size={28} className="text-gray-300" />
        </div>
        <p className="text-gray-400 font-medium">Tidak ada arsip di divisi ini</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {years.map((year, index) => {
        const count = getCount(year);
        return (
          <button
            key={year}
            onClick={() => onSelect(year)}
            className="group flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm text-center transition-all card-hover hover:border-blue-300 hover:bg-blue-50/30 animate-fade-in-up"
            style={{ animationDelay: `${index * 0.06}s` }}
          >
            <div className="p-3 rounded-2xl bg-blue-50 group-hover:scale-110 transition-transform">
              <Calendar size={22} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{year}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{count} arsip</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Archive List (final level) ───
function ArchiveList({ archives }: { archives: Archive[] }) {
  if (archives.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileText size={28} className="text-gray-300" />
        </div>
        <p className="text-gray-400 font-medium">Tidak ada arsip</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-400 font-medium mb-4">
        {archives.length} dokumen ditemukan
      </p>
      {archives.map((archive, index) => (
        <div
          key={archive.id}
          className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all animate-fade-in-up"
          style={{ animationDelay: `${index * 0.04}s` }}
        >
          <div className="p-3 bg-blue-50 rounded-xl shrink-0">
            <FileText size={20} className="text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-gray-900 truncate">
              {archive.title}
            </h4>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="font-mono text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                {archive.archiveNumber}
              </span>
              <span className="text-[10px] text-gray-400">
                {archive.letterNumber}
              </span>
              <span className="text-[10px] text-gray-300">&middot;</span>
              <span className="text-[10px] text-gray-400">
                {format(new Date(archive.date), "dd MMM yyyy", { locale: idLocale })}
              </span>
              {archive.user && (
                <>
                  <span className="text-[10px] text-gray-300">&middot;</span>
                  <span className="text-[10px] text-gray-400">
                    {archive.user.name}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link
              href={`/archives/${archive.id}`}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              title="Lihat Detail"
            >
              <Eye size={16} />
            </Link>
            <Link
              href={`/archives/${archive.id}/edit`}
              className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
              title="Edit"
            >
              <Edit3 size={16} />
            </Link>
            <a
              href={archive.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
              title="Download"
            >
              <Download size={16} />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
