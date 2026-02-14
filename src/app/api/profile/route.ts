import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getCurrentUser } from "../../../lib/rbac";
import bcrypt from "bcryptjs";

// GET /api/profile — Get current user profile
export async function GET() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      division: true,
      profileImage: true,
      createdAt: true,
      _count: { select: { archives: true } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

// PATCH /api/profile — Update own profile or change password
export async function PATCH(req: Request) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { name, email, division, profileImage, currentPassword, newPassword } = body;

  const updateData: any = {};

  // Update name
  if (name && name.trim()) {
    updateData.name = name.trim();
  }

  // Update email
  if (email && email.trim()) {
    const emailTrimmed = email.trim().toLowerCase();
    // Check if email is already taken by another user
    const existing = await prisma.user.findFirst({
      where: { email: emailTrimmed, NOT: { id: sessionUser.id } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Email is already used by another user" },
        { status: 400 }
      );
    }
    updateData.email = emailTrimmed;
  }

  // Update division
  if (division) {
    const validDivisions = ["KEUANGAN", "PENYELENGGARA", "TATA_USAHA", "UMUM"];
    if (!validDivisions.includes(division)) {
      return NextResponse.json(
        { error: "Invalid division" },
        { status: 400 }
      );
    }
    updateData.division = division;
  }

  // Update profile image (base64 data URI)
  if (profileImage !== undefined) {
    if (profileImage === null || profileImage === "") {
      updateData.profileImage = null;
    } else {
      // Validate that it's a data URI and not too large (max ~2MB)
      if (!profileImage.startsWith("data:image/")) {
        return NextResponse.json(
          { error: "Invalid image format" },
          { status: 400 }
        );
      }
      if (profileImage.length > 2 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Image size too large (max 2MB)" },
          { status: 400 }
        );
      }
      updateData.profileImage = profileImage;
    }
  }

  // Change password
  if (currentPassword && newPassword) {
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    updateData.password = await bcrypt.hash(newPassword, 12);
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: "No data was changed" },
      { status: 400 }
    );
  }

  const updatedUser = await prisma.user.update({
    where: { id: sessionUser.id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      division: true,
      profileImage: true,
    },
  });

  return NextResponse.json(updatedUser);
}
