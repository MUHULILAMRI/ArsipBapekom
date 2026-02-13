import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import DashboardCard from "../../../components/DashboardCard";
import { Archive, Wallet, Users, BookOpen, Briefcase } from "lucide-react";

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
    },
    {
      title: "Divisi Keuangan",
      value: keuangan,
      icon: Wallet,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Divisi Penyelenggara",
      value: penyelenggara,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Divisi Tata Usaha",
      value: tataUsaha,
      icon: BookOpen,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Divisi Umum",
      value: umum,
      icon: Briefcase,
      color: "text-teal-600",
      bgColor: "bg-teal-100",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Selamat datang kembali, {user?.name || "User"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((card) => (
          <DashboardCard key={card.title} {...card} />
        ))}
      </div>

      {/* Recent Archives */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Arsip Terbaru
        </h2>
        <RecentArchives />
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
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
        Belum ada arsip
      </div>
    );
  }

  const divisionColors: Record<string, string> = {
    KEUANGAN: "bg-green-100 text-green-700",
    PENYELENGGARA: "bg-blue-100 text-blue-700",
    TATA_USAHA: "bg-purple-100 text-purple-700",
    UMUM: "bg-orange-100 text-orange-700",
  };

  const divisionLabels: Record<string, string> = {
    KEUANGAN: "Keuangan",
    PENYELENGGARA: "Penyelenggara",
    TATA_USAHA: "Tata Usaha",
    UMUM: "Umum",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
              No. Arsip
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
              Judul
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
              Divisi
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
              Dibuat oleh
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {archives.map((archive) => (
            <tr key={archive.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-mono text-sm">
                {archive.archiveNumber}
              </td>
              <td className="px-4 py-3 text-sm font-medium">
                {archive.title}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    divisionColors[archive.division] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {divisionLabels[archive.division] || archive.division}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {archive.user.name}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
