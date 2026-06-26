import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getCurrentUser } from "../../../lib/rbac";
import { createNotification, notifyAdmins } from "../../../utils/notificationHelper";

// GET /api/borrow - List borrow requests
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};

    // USER and PEMINJAM can only see their own requests; Admin/Super Admin see all
    if (user.role === "USER" || user.role === "PEMINJAM") {
      where.userId = user.id;
    }

    // Optional status filter
    if (status && ["PENDING", "APPROVED", "REJECTED", "RETURNED"].includes(status)) {
      where.status = status;
    }

    const [requests, total] = await Promise.all([
      prisma.borrowRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          archive: {
            select: {
              id: true,
              archiveNumber: true,
              title: true,
              division: true,
              noBerkas: true,
              indeks: true,
              status: true,
              fileUrl: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              division: true,
            },
          },
        },
      }),
      prisma.borrowRequest.count({ where }),
    ]);

    // Secure fileUrl: only expose it if request is APPROVED or user is Admin/Staff of the same division
    const enrichedRequests = requests.map((req) => {
      const isStaffOrAdmin = user.role === "SUPER_ADMIN" || user.role === "ADMIN";
      const isUserOfDivision = user.role === "USER" && req.archive.division === user.division;
      const isApprovedBorrower = req.status === "APPROVED" && req.userId === user.id;
      
      const canAccessFile = isStaffOrAdmin || isUserOfDivision || isApprovedBorrower;
      
      return {
        ...req,
        archive: {
          ...req.archive,
          fileUrl: canAccessFile ? req.archive.fileUrl : null,
        },
      };
    });

    // Summary counts (for dashboard)
    const isStaffOrAdmin = user.role === "SUPER_ADMIN" || user.role === "ADMIN";
    const [pendingCount, approvedCount, returnedCount, rejectedCount] = await Promise.all([
      prisma.borrowRequest.count({ where: { ...(!isStaffOrAdmin ? { userId: user.id } : {}), status: "PENDING" } }),
      prisma.borrowRequest.count({ where: { ...(!isStaffOrAdmin ? { userId: user.id } : {}), status: "APPROVED" } }),
      prisma.borrowRequest.count({ where: { ...(!isStaffOrAdmin ? { userId: user.id } : {}), status: "RETURNED" } }),
      prisma.borrowRequest.count({ where: { ...(!isStaffOrAdmin ? { userId: user.id } : {}), status: "REJECTED" } }),
    ]);

    return NextResponse.json({
      requests: enrichedRequests,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      summary: { pendingCount, approvedCount, returnedCount, rejectedCount },
    });
  } catch (error: any) {
    console.error("Error fetching borrow requests:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan saat mengambil data peminjaman" },
      { status: 500 }
    );
  }
}

// POST /api/borrow - Create a new borrow request
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { archiveId, reason } = body;

    if (!archiveId || !reason || !reason.trim()) {
      return NextResponse.json(
        { error: "archiveId dan reason wajib diisi" },
        { status: 400 }
      );
    }

    // Verify archive exists
    const archive = await prisma.archive.findUnique({
      where: { id: archiveId },
      select: { id: true, title: true, archiveNumber: true, noBerkas: true, indeks: true },
    });

    if (!archive) {
      return NextResponse.json({ error: "Arsip tidak ditemukan" }, { status: 404 });
    }

    // Check if user already has an active (PENDING/APPROVED) request for this archive
    const existing = await prisma.borrowRequest.findFirst({
      where: {
        archiveId,
        userId: user.id,
        status: { in: ["PENDING", "APPROVED"] },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Anda sudah memiliki permohonan peminjaman aktif untuk arsip ini" },
        { status: 409 }
      );
    }

    const archiveLabel = archive.noBerkas || archive.indeks || archive.archiveNumber || archive.title;

    const borrowRequest = await prisma.borrowRequest.create({
      data: {
        archiveId,
        userId: user.id,
        reason: reason.trim(),
        status: "PENDING",
      },
      include: {
        archive: {
          select: { id: true, archiveNumber: true, title: true, division: true, noBerkas: true, indeks: true, status: true },
        },
        user: {
          select: { id: true, name: true, email: true, division: true },
        },
      },
    });

    // Notify admins about the new borrow request
    await notifyAdmins(
      "BORROW_REQUEST",
      "📋 Permohonan Peminjaman Baru",
      `${borrowRequest.user.name} mengajukan permohonan peminjaman arsip "${archiveLabel}". Alasan: ${reason.trim()}`,
      `/borrow`,
      user.id
    );

    return NextResponse.json(borrowRequest, { status: 201 });
  } catch (error: any) {
    console.error("Error creating borrow request:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan saat membuat permohonan peminjaman" },
      { status: 500 }
    );
  }
}
