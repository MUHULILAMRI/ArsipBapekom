import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import DashboardCard from "../../../components/DashboardCard";
import { Archive, Wallet, Users, BookOpen, Briefcase, TrendingUp, Clock, FileText } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  const [total, keuangan, penyelenggara, tataUsaha, umum] = await Promise.all([
    prisma.archive.count(),
    prisma.archive.count({ where: { division: "KEUANGAN" } }),
    prisma.archive.count({ where: { division: "PENYELENGGARA" } }),
    prisma.archive.count({ where: { division: "TATA_USAHA" } }),
    prisma.archive.count({ where: { division: "UMUM" } }),
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
      title: "Divisi Keuangan",
      value: keuangan,
      icon: Wallet,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      title: "Divisi Penyelenggara",
      value: penyelenggara,
      icon: Users,
      color: "text-violet-600",
      bgColor: "bg-violet-100",
      gradient: "from-violet-500 to-purple-500",
    },
    {
      title: "Divisi Tata Usaha",
      value: tataUsaha,
      icon: BookOpen,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      gradient: "from-amber-500 to-orange-500",
    },
    {
      title: "Divisi Umum",
      value: umum,
      icon: Briefcase,
      color: "text-rose-600",
      bgColor: "bg-rose-100",
      gradient: "from-rose-500 to-pink-500",
    },
  ];

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-8 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              Online
            </span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Selamat datang, {user?.name || "User"} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Pantau aktivitas pengarsipan dokumen Anda hari ini
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
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

      {/* Quick Actions & Recent Archives */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-500" />
            Aksi Cepat
          </h2>
          <div className="space-y-3">
            <a
              href="/archives/create"
              className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 card-hover"
            >
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform">
                <FileText size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Tambah Arsip Baru</p>
                <p className="text-xs text-gray-400 mt-0.5">Upload dokumen ke cloud storage</p>
              </div>
            </a>
            <a
              href="/archives"
              className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 card-hover"
            >
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-md shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <Archive size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Lihat Semua Arsip</p>
                <p className="text-xs text-gray-400 mt-0.5">Kelola dan cari dokumen</p>
              </div>
            </a>
          </div>
        </div>

        {/* Recent Archives */}
        <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
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

  const divisionColors: Record<string, string> = {
    KEUANGAN: "bg-emerald-50 text-emerald-700 border-emerald-200",
    PENYELENGGARA: "bg-blue-50 text-blue-700 border-blue-200",
    TATA_USAHA: "bg-violet-50 text-violet-700 border-violet-200",
    UMUM: "bg-amber-50 text-amber-700 border-amber-200",
  };

  const divisionLabels: Record<string, string> = {
    KEUANGAN: "Keuangan",
    PENYELENGGARA: "Penyelenggara",
    TATA_USAHA: "Tata Usaha",
    UMUM: "Umum",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                No. Arsip
              </th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Judul
              </th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Divisi
              </th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Tanggal
              </th>
            </tr>
          </thead>
          <tbody>
            {archives.map((archive, index) => (
              <tr
                key={archive.id}
                className="border-b border-gray-50 last:border-0 hover:bg-blue-50/30 transition-colors group"
              >
                <td className="px-5 py-3.5">
                  <span className="font-mono text-sm text-gray-600 bg-gray-50 px-2 py-0.5 rounded">
                    {archive.archiveNumber}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <a href={`/archives/${archive.id}`} className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                    {archive.title}
                  </a>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    oleh {archive.user.name}
                  </p>
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                      divisionColors[archive.division] || "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    {divisionLabels[archive.division] || archive.division}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-500">
                  {format(new Date(archive.createdAt), "dd MMM yyyy", {
                    locale: idLocale,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
