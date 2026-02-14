import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser, canEditArchive, canDeleteArchive } from "../../../../lib/rbac";
import { notifyAdmins } from "../../../../utils/notificationHelper";

// GET /api/archives/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }

  const { id } = await params;

  const archive = await prisma.archive.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true } } },
  });

  if (!archive) {
    return NextResponse.json({ error: "Arsip tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(archive);
}

// PUT /api/archives/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }

  if (!canEditArchive(user.role)) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const archive = await prisma.archive.update({
    where: { id },
    data: {
      ...(body.archiveNumber && { archiveNumber: body.archiveNumber }),
      ...(body.title && { title: body.title }),
      ...(body.letterNumber && { letterNumber: body.letterNumber }),
      ...(body.date && { date: new Date(body.date) }),
      ...(body.division && { division: body.division }),
      ...(body.status && { status: body.status }),
      ...(body.description !== undefined && { description: body.description }),
    },
  });

  // Notifikasi ke admin tentang update
  await notifyAdmins(
    "ARCHIVE_UPDATED",
    "Arsip Diperbarui",
    `Arsip "${archive.title}" telah diperbarui.`,
    `/archives/${archive.id}`,
    user.id
  );

  return NextResponse.json(archive);
}

// DELETE /api/archives/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }

  if (!canDeleteArchive(user.role)) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const { id } = await params;

  const archive = await prisma.archive.findUnique({ where: { id } });
  await prisma.archive.delete({ where: { id } });

  // Notifikasi ke admin tentang penghapusan
  if (archive) {
    await notifyAdmins(
      "ARCHIVE_DELETED",
      "Arsip Dihapus",
      `Arsip "${archive.title}" telah dihapus.`,
      undefined,
      user.id
    );
  }

  return NextResponse.json({ message: "Arsip berhasil dihapus" });
}
