import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import DashboardCard from "../../../components/DashboardCard";
import {
  Archive,
  Wallet,
  Users,
  BookOpen,
  Briefcase,
  TrendingUp,
  Clock,
  FileText,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  BarChart3,
  Zap,
  Plus,
} from "lucide-react";
import { format, subDays } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  const now = new Date();
  const sevenDaysAgo = subDays(now, 7);

  const [total, activeCount, inactiveCount, keuangan, penyelenggara, tataUsaha, umum, recentWeek] =
    await Promise.all([
      prisma.archive.count(),
      prisma.archive.count({ where: { status: "AKTIF" } }),
      prisma.archive.count({ where: { status: "INAKTIF" } }),
      prisma.archive.count({ where: { division: "KEUANGAN" } }),
      prisma.archive.count({ where: { division: "PENYELENGGARA" } }),
      prisma.archive.count({ where: { division: "TATA_USAHA" } }),
      prisma.archive.count({ where: { division: "UMUM" } }),
      prisma.archive.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    ]);

  const cards = [
    {
      title: "Total Arsip",
      value: total,
      icon: Archive,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Arsip Aktif",
      value: activeCount,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      title: "Arsip Inaktif",
      value: inactiveCount,
      icon: XCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      gradient: "from-orange-500 to-amber-500",
    },
    {
      title: "Minggu Ini",
      value: recentWeek,
      icon: TrendingUp,
      color: "text-violet-600",
      bgColor: "bg-violet-100",
      gradient: "from-violet-500 to-purple-500",
    },
  ];

  const divisionCards = [
    { title: "Keuangan", value: keuangan, icon: Wallet, color: "text-emerald-600", bgColor: "bg-emerald-100", gradient: "from-emerald-500 to-teal-500" },
    { title: "Penyelenggara", value: penyelenggara, icon: Users, color: "text-blue-600", bgColor: "bg-blue-100", gradient: "from-blue-500 to-indigo-500" },
    { title: "Tata Usaha", value: tataUsaha, icon: BookOpen, color: "text-amber-600", bgColor: "bg-amber-100", gradient: "from-amber-500 to-orange-500" },
    { title: "Umum", value: umum, icon: Briefcase, color: "text-rose-600", bgColor: "bg-rose-100", gradient: "from-rose-500 to-pink-500" },
  ];

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-8 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              Daring
            </span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Selamat datang, {user?.name || "Pengguna"} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Pantau aktivitas pengarsipan dokumen Anda hari ini
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((card, index) => (
          <div
            key={card.title}
            className="animate-fade-in-up"
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <DashboardCard {...card} />
          </div>
        ))}
      </div>

      {/* Division Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {divisionCards.map((card, index) => (
          <div
            key={card.title}
            className="animate-fade-in-up"
            style={{ animationDelay: `${(index + 4) * 0.08}s` }}
          >
            <DashboardCard {...card} />
          </div>
        ))}
      </div>

      {/* Quick Access & Analytics Overview & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Access */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap size={20} className="text-amber-500" />
            Akses Cepat
          </h2>
          <div className="space-y-3">
            <Link
              href="/archives/create"
              className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 card-hover"
            >
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform">
                <Plus size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Tambah Arsip Baru</p>
                <p className="text-xs text-gray-400 mt-0.5">Unggah dokumen ke penyimpanan awan</p>
              </div>
              <ArrowUpRight size={16} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
            </Link>

            <Link
              href="/archives?status=AKTIF"
              className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 card-hover"
            >
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-md shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <CheckCircle2 size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Arsip Aktif</p>
                <p className="text-xs text-gray-400 mt-0.5">{activeCount} dokumen aktif</p>
              </div>
              <ArrowUpRight size={16} className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
            </Link>

            <Link
              href="/archives?status=INAKTIF"
              className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 card-hover"
            >
              <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-md shadow-orange-500/20 group-hover:scale-110 transition-transform">
                <XCircle size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Arsip Inaktif</p>
                <p className="text-xs text-gray-400 mt-0.5">{inactiveCount} dokumen inaktif</p>
              </div>
              <ArrowUpRight size={16} className="text-gray-300 group-hover:text-orange-500 transition-colors" />
            </Link>

            <Link
              href="/analytics"
              className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 card-hover"
            >
              <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-md shadow-violet-500/20 group-hover:scale-110 transition-transform">
                <BarChart3 size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Lihat Analisis</p>
                <p className="text-xs text-gray-400 mt-0.5">Statistik & tren lengkap</p>
              </div>
              <ArrowUpRight size={16} className="text-gray-300 group-hover:text-violet-500 transition-colors" />
            </Link>
          </div>
        </div>

        {/* Status Overview */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-500" />
            Ringkasan Status
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm h-[calc(100%-44px)]">
            {/* Status Bars */}
            <div className="space-y-6 mb-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                    <span className="text-sm font-medium text-gray-700">Arsip Aktif</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{activeCount}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${total > 0 ? (activeCount / total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full" />
                    <span className="text-sm font-medium text-gray-700">Arsip Inaktif</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{inactiveCount}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-orange-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${total > 0 ? (inactiveCount / total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Stat Boxes */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-4 bg-emerald-50 rounded-xl">
                <p className="text-2xl font-bold text-emerald-700">
                  {total > 0 ? Math.round((activeCount / total) * 100) : 0}%
                </p>
                <p className="text-[10px] text-emerald-600 font-medium uppercase tracking-wide mt-0.5">
                  Aktif
                </p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-xl">
                <p className="text-2xl font-bold text-orange-700">
                  {total > 0 ? Math.round((inactiveCount / total) * 100) : 0}%
                </p>
                <p className="text-[10px] text-orange-600 font-medium uppercase tracking-wide mt-0.5">
                  Inaktif
                </p>
              </div>
            </div>

            {/* Division mini-stats */}
            <div className="mt-6 pt-5 border-t border-gray-50">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Per Divisi</p>
              <div className="space-y-2">
                {[
                  { name: "Keuangan", value: keuangan, color: "bg-emerald-500" },
                  { name: "Penyelenggara", value: penyelenggara, color: "bg-blue-500" },
                  { name: "Tata Usaha", value: tataUsaha, color: "bg-amber-500" },
                  { name: "Umum", value: umum, color: "bg-purple-500" },
                ].map((div) => (
                  <div key={div.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 ${div.color} rounded-full`} />
                      <span className="text-xs text-gray-600">{div.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-800">{div.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Archives */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={20} className="text-blue-500" />
            Arsip Terbaru
          </h2>
          <RecentArchives />
        </div>
      </div>
    </div>
  );
}

async function RecentArchives() {
  const archives = await prisma.archive.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  });

  if (archives.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Archive size={28} className="text-gray-300" />
        </div>
        <p className="text-gray-400 font-medium">Belum ada arsip</p>
        <p className="text-gray-300 text-sm mt-1">Mulai dengan menambahkan arsip pertama Anda</p>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    AKTIF: "bg-emerald-50 text-emerald-700",
    INAKTIF: "bg-orange-50 text-orange-700",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="divide-y divide-gray-50">
        {archives.map((archive) => (
          <Link
            key={archive.id}
            href={`/archives/${archive.id}`}
            className="group flex items-start gap-3 p-4 hover:bg-blue-50/30 transition-colors"
          >
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              <FileText size={16} className="text-blue-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                {archive.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                  {archive.archiveNumber}
                </span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${statusColors[archive.status] || ""}`}>
                  {archive.status === "AKTIF" ? "Aktif" : "Inaktif"}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                {archive.user.name} &middot;{" "}
                {format(new Date(archive.createdAt), "dd MMM yyyy", { locale: idLocale })}
              </p>
            </div>
          </Link>
        ))}
      </div>
      <div className="p-3 border-t border-gray-50 bg-gray-50/30">
        <Link
          href="/archives"
          className="flex items-center justify-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          Lihat Semua Arsip
          <ArrowUpRight size={12} />
        </Link>
      </div>
    </div>
  );
}
