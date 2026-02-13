import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser, canEditArchive, canDeleteArchive } from "../../../../lib/rbac";

// GET /api/archives/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const archive = await prisma.archive.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true } } },
  });

  if (!archive) {
    return NextResponse.json({ error: "Archive not found" }, { status: 404 });
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canEditArchive(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
      ...(body.description !== undefined && { description: body.description }),
    },
  });

  return NextResponse.json(archive);
}

// DELETE /api/archives/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canDeleteArchive(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  await prisma.archive.delete({ where: { id } });

  return NextResponse.json({ message: "Archive deleted" });
}
