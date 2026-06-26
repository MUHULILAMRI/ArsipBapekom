import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getCurrentUser, canManagePeminjam } from "../../../lib/rbac";

// GET /api/peminjam - List all PEMINJAM users (Admin/Super Admin only)
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManagePeminjam(user.role)) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const statusFilter = searchParams.get("status") || ""; // "active" | "suspended"
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = { role: "PEMINJAM" };

    if (statusFilter === "active") {
      where.isActive = true;
    } else if (statusFilter === "suspended") {
      where.isActive = false;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { instansi: { contains: search, mode: "insensitive" } },
      ];
    }

    const [peminjamList, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          instansi: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: { borrowRequests: true },
          },
          borrowRequests: {
            select: { status: true },
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    // Compute per-user borrow stats
    const enriched = peminjamList.map((p) => {
      const totalBorrow = p.borrowRequests.length;
      const pending = p.borrowRequests.filter((r) => r.status === "PENDING").length;
      const approved = p.borrowRequests.filter((r) => r.status === "APPROVED").length;
      const returned = p.borrowRequests.filter((r) => r.status === "RETURNED").length;
      const rejected = p.borrowRequests.filter((r) => r.status === "REJECTED").length;
      return {
        id: p.id,
        name: p.name,
        email: p.email,
        instansi: p.instansi,
        isActive: p.isActive,
        createdAt: p.createdAt,
        borrowStats: { total: totalBorrow, pending, approved, returned, rejected },
      };
    });

    // Summary counts
    const [totalAll, totalActive, totalSuspended] = await Promise.all([
      prisma.user.count({ where: { role: "PEMINJAM" } }),
      prisma.user.count({ where: { role: "PEMINJAM", isActive: true } }),
      prisma.user.count({ where: { role: "PEMINJAM", isActive: false } }),
    ]);
    const totalBorrowAll = await prisma.borrowRequest.count({
      where: { user: { role: "PEMINJAM" } },
    });

    return NextResponse.json({
      peminjam: enriched,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      summary: { totalAll, totalActive, totalSuspended, totalBorrowAll },
    });
  } catch (error: any) {
    console.error("Error fetching peminjam:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}
