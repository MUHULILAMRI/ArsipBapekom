import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Archive,
  CheckCircle2,
  XCircle,
  Calendar,
  Building2,
  Users,
  FileText,
  Clock,
  Activity,
  PieChart,
  ArrowUpRight,
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import Link from "next/link";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);
  const sixtyDaysAgo = subDays(now, 60);
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  // Base where clause for RBAC
  const baseWhere: any = {};
  if (user?.role === "USER") {
    baseWhere.division = user.division;
  }

  const [
    totalArchives,
    activeArchives,
    inactiveArchives,
    thisMonthCount,
    lastMonthCount,
    last30Days,
    prev30Days,
    keuangan,
    penyelenggara,
    tataUsaha,
    umum,
    totalUsers,
    recentArchives,
    // Monthly breakdown
    monthlyData,
  ] = await Promise.all([
    prisma.archive.count({ where: baseWhere }),
    prisma.archive.count({ where: { ...baseWhere, status: "AKTIF" } }),
    prisma.archive.count({ where: { ...baseWhere, status: "INAKTIF" } }),
    prisma.archive.count({
      where: { ...baseWhere, createdAt: { gte: currentMonthStart, lte: currentMonthEnd } },
    }),
    prisma.archive.count({
      where: { ...baseWhere, createdAt: { gte: lastMonthStart, lte: lastMonthEnd } },
    }),
    prisma.archive.count({
      where: { ...baseWhere, createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.archive.count({
      where: { ...baseWhere, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
    }),
    prisma.archive.count({ where: { ...baseWhere, division: "KEUANGAN" } }),
    prisma.archive.count({ where: { ...baseWhere, division: "PENYELENGGARA" } }),
    prisma.archive.count({ where: { ...baseWhere, division: "TATA_USAHA" } }),
    prisma.archive.count({ where: { ...baseWhere, division: "UMUM" } }),
    prisma.user.count(),
    prisma.archive.findMany({
      where: baseWhere,
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    }),
    // Get last 6 months of data
    Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const monthStart = startOfMonth(subMonths(now, i));
        const monthEnd = endOfMonth(subMonths(now, i));
        return prisma.archive.count({
          where: { ...baseWhere, createdAt: { gte: monthStart, lte: monthEnd } },
        }).then((count) => ({
          month: format(monthStart, "MMM", { locale: idLocale }),
          count,
        }));
      })
    ),
  ]);

  const monthlyReversed = [...monthlyData].reverse();
  const maxMonthly = Math.max(...monthlyReversed.map((m) => m.count), 1);

  const growthPercent =
    prev30Days > 0
      ? Math.round(((last30Days - prev30Days) / prev30Days) * 100)
      : last30Days > 0
      ? 100
      : 0;

  const monthGrowth =
    lastMonthCount > 0
      ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)
      : thisMonthCount > 0
      ? 100
      : 0;

  const divisions = [
    { name: "Keuangan", value: keuangan, color: "bg-emerald-500", lightColor: "bg-emerald-100 text-emerald-700" },
    { name: "Penyelenggara", value: penyelenggara, color: "bg-blue-500", lightColor: "bg-blue-100 text-blue-700" },
    { name: "Tata Usaha", value: tataUsaha, color: "bg-amber-500", lightColor: "bg-amber-100 text-amber-700" },
    { name: "Umum", value: umum, color: "bg-purple-500", lightColor: "bg-purple-100 text-purple-700" },
  ];

  const activePercent = totalArchives > 0 ? Math.round((activeArchives / totalArchives) * 100) : 0;
  const inactivePercent = totalArchives > 0 ? Math.round((inactiveArchives / totalArchives) * 100) : 0;

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-100 rounded-xl">
            <BarChart3 size={20} className="text-violet-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Analisis Arsip
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              Ringkasan dan statistik pengarsipan dokumen
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-gray-400 bg-white rounded-xl px-4 py-2 border border-gray-100">
          <Calendar size={14} />
          <span>{format(now, "dd MMMM yyyy", { locale: idLocale })}</span>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Total */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Archive size={18} className="text-blue-600" />
            </div>
            <div className={`flex items-center gap-1 text-xs font-medium ${growthPercent >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {growthPercent >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {Math.abs(growthPercent)}%
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalArchives}</p>
          <p className="text-xs text-gray-400 mt-1">Total Arsip</p>
        </div>

        {/* Active */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-emerald-50 rounded-xl">
              <CheckCircle2 size={18} className="text-emerald-600" />
            </div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {activePercent}%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{activeArchives}</p>
          <p className="text-xs text-gray-400 mt-1">Arsip Aktif</p>
        </div>

        {/* Inactive */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-orange-50 rounded-xl">
              <XCircle size={18} className="text-orange-600" />
            </div>
            <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
              {inactivePercent}%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{inactiveArchives}</p>
          <p className="text-xs text-gray-400 mt-1">Arsip Inaktif</p>
        </div>

        {/* This Month */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-violet-50 rounded-xl">
              <Calendar size={18} className="text-violet-600" />
            </div>
            <div className={`flex items-center gap-1 text-xs font-medium ${monthGrowth >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {monthGrowth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {Math.abs(monthGrowth)}%
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{thisMonthCount}</p>
          <p className="text-xs text-gray-400 mt-1">Bulan Ini</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Monthly Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Activity size={16} className="text-blue-500" />
              Tren Arsip 6 Bulan Terakhir
            </h2>
          </div>
          <div className="flex items-end gap-3 h-48">
            {monthlyReversed.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-semibold text-gray-700">{m.count}</span>
                <div
                  className="w-full bg-gradient-to-t from-blue-500 to-indigo-400 rounded-t-lg transition-all duration-500 min-h-[4px]"
                  style={{ height: `${(m.count / maxMonthly) * 100}%` }}
                />
                <span className="text-[10px] font-medium text-gray-400 uppercase">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-6">
            <PieChart size={16} className="text-violet-500" />
            Kategori Status
          </h2>

          <div className="space-y-5">
            {/* Active */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                  <span className="text-sm font-medium text-gray-700">Aktif</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{activeArchives}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${activePercent}%` }}
                />
              </div>
            </div>

            {/* Inactive */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full" />
                  <span className="text-sm font-medium text-gray-700">Inaktif</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{inactiveArchives}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-orange-400 to-orange-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${inactivePercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-gray-50">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-emerald-50 rounded-xl">
                <p className="text-lg font-bold text-emerald-700">{activePercent}%</p>
                <p className="text-[10px] text-emerald-600 font-medium uppercase tracking-wide mt-0.5">Aktif</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-xl">
                <p className="text-lg font-bold text-orange-700">{inactivePercent}%</p>
                <p className="text-[10px] text-orange-600 font-medium uppercase tracking-wide mt-0.5">Inaktif</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Division Distribution */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-6">
            <Building2 size={16} className="text-blue-500" />
            Distribusi per Divisi
          </h2>
          <div className="space-y-4">
            {divisions.map((div) => (
              <div key={div.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-700">{div.name}</span>
                  <span className="text-sm font-bold text-gray-900">{div.value}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`${div.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${totalArchives > 0 ? (div.value / totalArchives) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Access */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-6">
            <ArrowUpRight size={16} className="text-blue-500" />
            Akses Cepat
          </h2>
          <div className="space-y-3">
            <Link
              href="/archives?status=AKTIF"
              className="group flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 transition-all border border-gray-50 hover:border-emerald-200"
            >
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CheckCircle2 size={16} className="text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Arsip Aktif</p>
                <p className="text-xs text-gray-400">{activeArchives} dokumen</p>
              </div>
              <ArrowUpRight size={14} className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
            </Link>
            <Link
              href="/archives?status=INAKTIF"
              className="group flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 transition-all border border-gray-50 hover:border-orange-200"
            >
              <div className="p-2 bg-orange-100 rounded-lg">
                <XCircle size={16} className="text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Arsip Inaktif</p>
                <p className="text-xs text-gray-400">{inactiveArchives} dokumen</p>
              </div>
              <ArrowUpRight size={14} className="text-gray-300 group-hover:text-orange-500 transition-colors" />
            </Link>
            <Link
              href="/archives/create"
              className="group flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-all border border-gray-50 hover:border-blue-200"
            >
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText size={16} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Tambah Arsip</p>
                <p className="text-xs text-gray-400">Unggah dokumen baru</p>
              </div>
              <ArrowUpRight size={14} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
            </Link>
            {(user?.role === "SUPER_ADMIN" || user?.role === "ADMIN") && (
              <Link
                href="/admin/users"
                className="group flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 transition-all border border-gray-50 hover:border-indigo-200"
              >
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Users size={16} className="text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Kelola User</p>
                  <p className="text-xs text-gray-400">{totalUsers} pengguna</p>
                </div>
                <ArrowUpRight size={14} className="text-gray-300 group-hover:text-indigo-500 transition-colors" />
              </Link>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-6">
            <Clock size={16} className="text-blue-500" />
            Aktivitas Terbaru
          </h2>
          {recentArchives.length === 0 ? (
            <div className="text-center py-8">
              <Archive size={28} className="text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Belum ada aktivitas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentArchives.map((archive) => (
                <Link
                  key={archive.id}
                  href={`/archives/${archive.id}`}
                  className="group flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <FileText size={14} className="text-blue-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                      {archive.title}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {archive.user.name} &middot;{" "}
                      {format(new Date(archive.createdAt), "dd MMM", { locale: idLocale })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
