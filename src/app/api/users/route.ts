import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getCurrentUser, canManageUsers } from "../../../lib/rbac";
import bcrypt from "bcryptjs";

// GET /api/users - List users
export async function GET() {
  const user = await getCurrentUser();
  if (!user || !canManageUsers(user.role)) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      division: true,
      createdAt: true,
      _count: { select: { archives: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

// POST /api/users - Create user
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !canManageUsers(user.role)) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const body = await req.json();
  const { name, email, password, role, division } = body;

  if (!name || !email || !password || !role || !division) {
    return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
  }

  // Validate role
  const validRoles = ["SUPER_ADMIN", "ADMIN", "USER"];
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  // Validate division
  const validDivisions = ["KEUANGAN", "PENYELENGGARA", "TATA_USAHA", "UMUM"];
  if (!validDivisions.includes(division)) {
    return NextResponse.json({ error: "Invalid division" }, { status: 400 });
  }

  // Validate password length
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (exists) {
    return NextResponse.json({ error: "Email is already registered" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = await prisma.user.create({
    data: { name: name.trim(), email: email.trim().toLowerCase(), password: hashedPassword, role, division },
    select: { id: true, name: true, email: true, role: true, division: true },
  });

  return NextResponse.json(newUser, { status: 201 });
}
