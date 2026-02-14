import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser, canManageUsers } from "../../../../lib/rbac";
import bcrypt from "bcryptjs";

// PUT /api/users/[id] — Update user
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser || !canManageUsers(currentUser.role)) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { name, email, role, division, password } = body;

  // Check if email already used by another user
  if (email) {
    const existing = await prisma.user.findFirst({
      where: { email, id: { not: id } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Email sudah digunakan user lain" },
        { status: 400 }
      );
    }
  }

  const updateData: any = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (role) updateData.role = role;
  if (division) updateData.division = division;
  if (password && password.length >= 6) {
    updateData.password = await bcrypt.hash(password, 12);
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      division: true,
      createdAt: true,
    },
  });

  return NextResponse.json(user);
}

// DELETE /api/users/[id] — Delete user
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser || !canManageUsers(currentUser.role)) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const { id } = await params;

  // Prevent deleting self
  if (id === currentUser.id) {
    return NextResponse.json(
      { error: "Tidak dapat menghapus akun sendiri" },
      { status: 400 }
    );
  }

  // Check if user has archives
  const archiveCount = await prisma.archive.count({
    where: { createdBy: id },
  });

  if (archiveCount > 0) {
    return NextResponse.json(
      {
        error: `User memiliki ${archiveCount} arsip. Hapus atau pindahkan arsip terlebih dahulu.`,
      },
      { status: 400 }
    );
  }

  // Delete notifications first
  await prisma.notification.deleteMany({ where: { userId: id } });

  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ message: "User berhasil dihapus" });
}
