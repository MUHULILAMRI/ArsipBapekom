import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import {
  ClipboardList,
  FileText,
  User,
  Clock,
  Building2,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

const divisionLabels: Record<string, string> = {
  KEUANGAN: "Keuangan",
  PENYELENGGARA: "Penyelenggara",
  TATA_USAHA: "Tata Usaha",
  UMUM: "Umum",
};

const divisionColors: Record<string, string> = {
  KEUANGAN: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENYELENGGARA: "bg-blue-50 text-blue-700 border-blue-200",
  TATA_USAHA: "bg-amber-50 text-amber-700 border-amber-200",
  UMUM: "bg-purple-50 text-purple-700 border-purple-200",
};

const statusColors: Record<string, string> = {
  AKTIF: "bg-emerald-50 text-emerald-700 border-emerald-200",
  INAKTIF: "bg-orange-50 text-orange-700 border-orange-200",
};

export default async function ActivityPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-gray-400">Anda tidak memiliki akses ke halaman ini.</p>
      </div>
    );
  }

  const recentArchives = await prisma.archive.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true, division: true } } },
  });

  // Group by date
  const grouped = recentArchives.reduce((acc, archive) => {
    const dateKey = format(new Date(archive.createdAt), "yyyy-MM-dd");
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(archive);
    return acc;
  }, {} as Record<string, typeof recentArchives>);

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-100 rounded-xl">
            <ClipboardList size={20} className="text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Log Aktivitas
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              Riwayat seluruh aktivitas pengarsipan
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-gray-400 bg-white rounded-xl px-4 py-2 border border-gray-100">
          <Filter size={14} />
          <span>{recentArchives.length} aktivitas terakhir</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {Object.entries(grouped).map(([dateKey, archives]) => (
          <div key={dateKey}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Clock size={14} className="text-blue-600" />
              </div>
              <h2 className="text-sm font-semibold text-gray-700">
                {format(new Date(dateKey), "EEEE, dd MMMM yyyy", {
                  locale: idLocale,
                })}
              </h2>
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                {archives.length} arsip
              </span>
            </div>

            <div className="space-y-3 ml-3 border-l-2 border-gray-100 pl-6">
              {archives.map((archive) => (
                <div
                  key={archive.id}
                  className="relative bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all hover:border-gray-200"
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-[31px] top-6 w-4 h-4 bg-white border-2 border-blue-400 rounded-full" />

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="p-2 bg-blue-50 rounded-xl shrink-0">
                        <FileText size={16} className="text-blue-500" />
                      </div>
                      <div className="min-w-0">
                        <a
                          href={`/archives/${archive.id}`}
                          className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {archive.title}
                        </a>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-2 flex-wrap">
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            {archive.user.name}
                          </span>
                          <span>•</span>
                          <span className="font-mono bg-gray-50 px-1.5 py-0.5 rounded">
                            {archive.archiveNumber}
                          </span>
                          <span>•</span>
                          <span>
                            {format(new Date(archive.createdAt), "HH:mm", {
                              locale: idLocale,
                            })}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${
                          statusColors[archive.status] || "bg-gray-50 text-gray-600 border-gray-200"
                        }`}
                      >
                        {archive.status}
                      </span>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${
                          divisionColors[archive.division] || "bg-gray-50 text-gray-600 border-gray-200"
                        }`}
                      >
                        {divisionLabels[archive.division] || archive.division}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {Object.keys(grouped).length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-4 bg-gray-50 rounded-2xl inline-block mb-4">
              <ClipboardList size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Belum Ada Aktivitas
            </h3>
            <p className="text-sm text-gray-400">
              Log akan muncul setelah ada arsip yang ditambahkan
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
