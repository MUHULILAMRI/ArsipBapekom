import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/rbac";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // Get storage config
    const googleConfig = await prisma.storageConfig.findFirst({
      where: { provider: "google", isActive: true },
      select: {
        id: true,
        provider: true,
        isActive: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Get archive stats
    const [totalArchives, totalByDivision, totalByStatus, recentUploads, oldestArchive, newestArchive] =
      await Promise.all([
        prisma.archive.count(),
        prisma.archive.groupBy({
          by: ["division"],
          _count: { _all: true },
        }),
        prisma.archive.groupBy({
          by: ["status"],
          _count: { _all: true },
        }),
        prisma.archive.findMany({
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            fileUrl: true,
            division: true,
            createdAt: true,
            user: { select: { name: true } },
          },
        }),
        prisma.archive.findFirst({
          orderBy: { createdAt: "asc" },
          select: { createdAt: true },
        }),
        prisma.archive.findFirst({
          orderBy: { createdAt: "desc" },
          select: { createdAt: true },
        }),
      ]);

    // Monthly upload stats (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const archivesLast6Months = await prisma.archive.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    });

    const monthlyUploads: Record<string, number> = {};
    archivesLast6Months.forEach((a) => {
      const key = `${a.createdAt.getFullYear()}-${String(a.createdAt.getMonth() + 1).padStart(2, "0")}`;
      monthlyUploads[key] = (monthlyUploads[key] || 0) + 1;
    });

    const divisionStats = totalByDivision.map((d) => ({
      division: d.division,
      count: d._count._all,
    }));

    const statusStats = totalByStatus.map((s) => ({
      status: s.status,
      count: s._count._all,
    }));

    const tokenStatus = googleConfig
      ? {
          connected: true,
          expiresAt: googleConfig.expiresAt,
          isExpired: googleConfig.expiresAt ? new Date() > googleConfig.expiresAt : false,
          connectedSince: googleConfig.createdAt,
          lastUpdated: googleConfig.updatedAt,
        }
      : { connected: false };

    return NextResponse.json({
      storage: {
        google: tokenStatus,
      },
      stats: {
        totalFiles: totalArchives,
        divisionStats,
        statusStats,
        monthlyUploads,
        recentUploads,
        oldestArchive: oldestArchive?.createdAt || null,
        newestArchive: newestArchive?.createdAt || null,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch storage info" },
      { status: 500 }
    );
  }
}
