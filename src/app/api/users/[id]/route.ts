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
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { name, email, role, division, password } = body;

  // Validate role if being changed
  if (role) {
    const validRoles = ["SUPER_ADMIN", "ADMIN", "USER"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
  }

  // Validate division if being changed
  if (division) {
    const validDivisions = ["KEUANGAN", "PENYELENGGARA", "TATA_USAHA", "UMUM"];
    if (!validDivisions.includes(division)) {
      return NextResponse.json({ error: "Invalid division" }, { status: 400 });
    }
  }

  // Check if email already used by another user
  if (email) {
    const existing = await prisma.user.findFirst({
      where: { email: email.trim().toLowerCase(), id: { not: id } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Email is already used by another user" },
        { status: 400 }
      );
    }
  }

  const updateData: any = {};
  if (name) updateData.name = String(name).trim();
  if (email) updateData.email = String(email).trim().toLowerCase();
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
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const { id } = await params;

  // Prevent deleting self
  if (id === currentUser.id) {
    return NextResponse.json(
      { error: "Cannot delete your own account" },
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
        error: `User has ${archiveCount} archives. Delete or reassign archives first.`,
      },
      { status: 400 }
    );
  }

  // Delete notifications first
  await prisma.notification.deleteMany({ where: { userId: id } });

  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ message: "User deleted successfully" });
}
