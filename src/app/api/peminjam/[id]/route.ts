import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser, canManagePeminjam, canManageUsers } from "../../../../lib/rbac";

// PATCH /api/peminjam/[id] - Toggle isActive (Admin/Super Admin)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManagePeminjam(user.role)) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json({ error: "Field isActive harus berupa boolean" }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { id } });

    if (!target || target.role !== "PEMINJAM") {
      return NextResponse.json({ error: "Pengguna tidak ditemukan atau bukan Peminjam" }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        instansi: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating peminjam:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}

// DELETE /api/peminjam/[id] - Delete peminjam account (Super Admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageUsers(user.role)) {
      return NextResponse.json({ error: "Akses ditolak. Hanya Super Admin yang dapat menghapus akun." }, { status: 403 });
    }

    const { id } = await params;

    const target = await prisma.user.findUnique({ where: { id } });

    if (!target || target.role !== "PEMINJAM") {
      return NextResponse.json({ error: "Pengguna tidak ditemukan atau bukan Peminjam" }, { status: 404 });
    }

    // Delete related borrow requests first, then notifications, then user
    await prisma.$transaction([
      prisma.borrowRequest.deleteMany({ where: { userId: id } }),
      prisma.notification.deleteMany({ where: { userId: id } }),
      prisma.user.delete({ where: { id } }),
    ]);

    return NextResponse.json({ success: true, message: "Akun peminjam berhasil dihapus" });
  } catch (error: any) {
    console.error("Error deleting peminjam:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}
