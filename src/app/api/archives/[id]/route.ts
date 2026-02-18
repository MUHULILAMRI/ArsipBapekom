import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser, canEditArchive, canDeleteArchive, canAccessDivision } from "../../../../lib/rbac";
import { notifyAdmins } from "../../../../utils/notificationHelper";

// GET /api/archives/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  const archive = await prisma.archive.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true } } },
  });

  if (!archive) {
    return NextResponse.json({ error: "Archive not found" }, { status: 404 });
  }

  // RBAC: USER can only view archives from their own division
  if (!canAccessDivision(user.role, user.division, archive.division)) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  return NextResponse.json(archive);
  } catch (error: any) {
    console.error("Error fetching archive:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}

// PUT /api/archives/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!canEditArchive(user.role)) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const { id } = await params;

  // Verify archive exists and user has division access
  const existing = await prisma.archive.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Archive not found" }, { status: 404 });
  }
  if (!canAccessDivision(user.role, user.division, existing.division)) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const body = await req.json();

  // Validate division if being changed
  if (body.division) {
    const validDivisions = ["KEUANGAN", "PENYELENGGARA", "TATA_USAHA", "UMUM"];
    if (!validDivisions.includes(body.division)) {
      return NextResponse.json({ error: "Invalid division" }, { status: 400 });
    }
  }

  // Validate status if being changed
  if (body.status && !["AKTIF", "INAKTIF"].includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const archive = await prisma.archive.update({
    where: { id },
    data: {
      ...(body.archiveNumber && { archiveNumber: String(body.archiveNumber).trim() }),
      ...(body.title && { title: String(body.title).trim() }),
      ...(body.letterNumber && { letterNumber: String(body.letterNumber).trim() }),
      ...(body.date && { date: new Date(body.date) }),
      ...(body.division && { division: body.division }),
      ...(body.status && { status: body.status }),
      ...(body.description !== undefined && { description: body.description ? String(body.description).trim() : null }),
      // Arsip Aktif fields
      ...(body.noBerkas !== undefined && { noBerkas: body.noBerkas ? String(body.noBerkas).trim() : null }),
      ...(body.noUrut !== undefined && { noUrut: body.noUrut ? String(body.noUrut).trim() : null }),
      ...(body.kode !== undefined && { kode: body.kode ? String(body.kode).trim() : null }),
      ...(body.indexPekerjaan !== undefined && { indexPekerjaan: body.indexPekerjaan ? String(body.indexPekerjaan).trim() : null }),
      ...(body.uraianMasalah !== undefined && { uraianMasalah: body.uraianMasalah ? String(body.uraianMasalah).trim() : null }),
      ...(body.tahun !== undefined && { tahun: body.tahun ? String(body.tahun).trim() : null }),
      ...(body.jumlahBerkas !== undefined && { jumlahBerkas: body.jumlahBerkas ? String(body.jumlahBerkas).trim() : null }),
      ...(body.keteranganAsliCopy !== undefined && { keteranganAsliCopy: body.keteranganAsliCopy ? String(body.keteranganAsliCopy).trim() : null }),
      ...(body.keteranganBox !== undefined && { keteranganBox: body.keteranganBox ? String(body.keteranganBox).trim() : null }),
      // Arsip Inaktif fields
      ...(body.noItem !== undefined && { noItem: body.noItem ? String(body.noItem).trim() : null }),
      ...(body.kodeKlasifikasi !== undefined && { kodeKlasifikasi: body.kodeKlasifikasi ? String(body.kodeKlasifikasi).trim() : null }),
      ...(body.indeks !== undefined && { indeks: body.indeks ? String(body.indeks).trim() : null }),
      ...(body.uraianInformasi !== undefined && { uraianInformasi: body.uraianInformasi ? String(body.uraianInformasi).trim() : null }),
      ...(body.kurunWaktu !== undefined && { kurunWaktu: body.kurunWaktu ? String(body.kurunWaktu).trim() : null }),
      ...(body.keteranganSKKAAD !== undefined && { keteranganSKKAAD: body.keteranganSKKAAD ? String(body.keteranganSKKAAD).trim() : null }),
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

  } catch (error: any) {
    console.error("Error updating archive:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan saat memperbarui arsip" },
      { status: 500 }
    );
  }
}

// DELETE /api/archives/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!canDeleteArchive(user.role)) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const { id } = await params;

  const archive = await prisma.archive.findUnique({ where: { id } });
  if (!archive) {
    return NextResponse.json({ error: "Archive not found" }, { status: 404 });
  }

  // RBAC: Check division access
  if (!canAccessDivision(user.role, user.division, archive.division)) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  await prisma.archive.delete({ where: { id } });

  // Notifikasi ke admin tentang penghapusan
  await notifyAdmins(
    "ARCHIVE_DELETED",
    "Arsip Dihapus",
    `Arsip "${archive.title}" telah dihapus.`,
    undefined,
    user.id
  );

  return NextResponse.json({ message: "Arsip berhasil dihapus" });
  } catch (error: any) {
    console.error("Error deleting archive:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan saat menghapus arsip" },
      { status: 500 }
    );
  }
}
