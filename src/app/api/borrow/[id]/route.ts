import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/rbac";
import { createNotification } from "../../../../utils/notificationHelper";

// PUT /api/borrow/[id] - Update borrow request status (Admin/Super Admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, adminNotes } = body;

    const allowedStatus = ["APPROVED", "REJECTED", "RETURNED"];
    if (!status || !allowedStatus.includes(status)) {
      return NextResponse.json(
        { error: "Status tidak valid. Gunakan: APPROVED, REJECTED, atau RETURNED" },
        { status: 400 }
      );
    }

    // Find existing request
    const existing = await prisma.borrowRequest.findUnique({
      where: { id },
      include: {
        archive: { select: { id: true, title: true, archiveNumber: true, noBerkas: true, indeks: true } },
        user: { select: { id: true, name: true } },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Permohonan peminjaman tidak ditemukan" }, { status: 404 });
    }

    // Validate state transitions
    if (status === "APPROVED" && existing.status !== "PENDING") {
      return NextResponse.json({ error: "Hanya permohonan berstatus PENDING yang dapat disetujui" }, { status: 409 });
    }
    if (status === "REJECTED" && existing.status !== "PENDING") {
      return NextResponse.json({ error: "Hanya permohonan berstatus PENDING yang dapat ditolak" }, { status: 409 });
    }
    if (status === "RETURNED" && existing.status !== "APPROVED") {
      return NextResponse.json({ error: "Hanya permohonan berstatus APPROVED yang dapat dikembalikan" }, { status: 409 });
    }

    const archiveLabel =
      existing.archive.noBerkas || existing.archive.indeks || existing.archive.archiveNumber || existing.archive.title;

    const updateData: any = {
      status,
      adminNotes: adminNotes?.trim() || null,
    };

    if (status === "RETURNED") {
      updateData.returnDate = new Date();
    }

    const updated = await prisma.borrowRequest.update({
      where: { id },
      data: updateData,
      include: {
        archive: {
          select: { id: true, archiveNumber: true, title: true, division: true, noBerkas: true, indeks: true, status: true },
        },
        user: {
          select: { id: true, name: true, email: true, division: true },
        },
      },
    });

    // Notify the requester about status change
    const notifMap: Record<string, { type: any; title: string; message: string }> = {
      APPROVED: {
        type: "BORROW_APPROVED",
        title: "✅ Permohonan Peminjaman Disetujui",
        message: `Permohonan peminjaman arsip "${archiveLabel}" Anda telah disetujui.${adminNotes ? ` Catatan: ${adminNotes.trim()}` : ""}`,
      },
      REJECTED: {
        type: "BORROW_REJECTED",
        title: "❌ Permohonan Peminjaman Ditolak",
        message: `Permohonan peminjaman arsip "${archiveLabel}" Anda ditolak.${adminNotes ? ` Alasan: ${adminNotes.trim()}` : ""}`,
      },
      RETURNED: {
        type: "BORROW_RETURNED",
        title: "📦 Arsip Telah Dikembalikan",
        message: `Arsip "${archiveLabel}" telah tercatat sebagai dikembalikan.${adminNotes ? ` Catatan: ${adminNotes.trim()}` : ""}`,
      },
    };

    const notif = notifMap[status];
    if (notif) {
      await createNotification({
        userId: existing.user.id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        link: "/borrow",
      });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating borrow request:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan saat memperbarui status peminjaman" },
      { status: 500 }
    );
  }
}

// DELETE /api/borrow/[id] - Cancel own PENDING request (User only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.borrowRequest.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Permohonan peminjaman tidak ditemukan" }, { status: 404 });
    }

    // Only the owner can cancel their own PENDING request
    if (existing.userId !== user.id && user.role === "USER") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    if (existing.status !== "PENDING") {
      return NextResponse.json({ error: "Hanya permohonan berstatus PENDING yang dapat dibatalkan" }, { status: 409 });
    }

    await prisma.borrowRequest.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting borrow request:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan saat membatalkan permohonan peminjaman" },
      { status: 500 }
    );
  }
}
