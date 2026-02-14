import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getCurrentUser, canAccessDivision } from "../../../lib/rbac";
import { createNotification, notifyAdmins } from "../../../utils/notificationHelper";

// GET /api/archives - List archives
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const division = searchParams.get("division");
  const search = searchParams.get("search");
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const sortByParam = searchParams.get("sortBy") || "createdAt";
  const sortOrderParam = searchParams.get("sortOrder") || "desc";

  // Whitelist allowed sort fields to prevent injection
  const allowedSortFields = ["createdAt", "date", "title", "archiveNumber", "letterNumber", "division", "status"];
  const sortBy = allowedSortFields.includes(sortByParam) ? sortByParam : "createdAt";
  const sortOrder: "asc" | "desc" = sortOrderParam === "asc" ? "asc" : "desc";

  const where: any = {};

  // RBAC: USER can only see their division
  if (user.role === "USER") {
    where.division = user.division;
  } else if (division) {
    where.division = division;
  }

  // Status filter
  if (status === "AKTIF" || status === "INAKTIF") {
    where.status = status;
  }

  // Search
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { archiveNumber: { contains: search, mode: "insensitive" } },
      { letterNumber: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [archives, total] = await Promise.all([
    prisma.archive.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.archive.count({ where }),
  ]);

  return NextResponse.json({
    archives,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// POST /api/archives - Create archive
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { archiveNumber, title, letterNumber, date, division, description, fileUrl, fileId, status } = body;

  if (!archiveNumber || !title || !letterNumber || !date || !division || !fileUrl || !fileId) {
    return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
  }

  // Validate division
  const validDivisions = ["KEUANGAN", "PENYELENGGARA", "TATA_USAHA", "UMUM"];
  if (!validDivisions.includes(division)) {
    return NextResponse.json({ error: "Invalid division" }, { status: 400 });
  }

  // Validate status
  if (status && !["AKTIF", "INAKTIF"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // Check access
  if (!canAccessDivision(user.role, user.division, division)) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const archive = await prisma.archive.create({
    data: {
      archiveNumber: String(archiveNumber).trim(),
      title: String(title).trim(),
      letterNumber: String(letterNumber).trim(),
      date: new Date(date),
      division,
      status: status || "AKTIF",
      description: description ? String(description).trim() : null,
      fileUrl,
      fileId,
      createdBy: user.id,
    },
  });

  // Buat notifikasi untuk user yang membuat
  await createNotification({
    userId: user.id,
    type: "ARCHIVE_CREATED",
    title: "Arsip Baru Dibuat",
    message: `Arsip "${title}" berhasil dibuat.`,
    link: `/archives/${archive.id}`,
  });

  // Notifikasi ke admin/super admin
  await notifyAdmins(
    "ARCHIVE_CREATED",
    "Arsip Baru Ditambahkan",
    `Arsip "${title}" ditambahkan oleh ${user.division}.`,
    `/archives/${archive.id}`,
    user.id
  );

  return NextResponse.json(archive, { status: 201 });
}
