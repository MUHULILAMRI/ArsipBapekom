import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcryptjs";
import { notifyAdmins } from "../../../../utils/notificationHelper";

// POST /api/auth/register - Public self-registration for PEMINJAM role
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, instansi } = body;

    // --- Validation ---
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Nama lengkap wajib diisi." }, { status: 400 });
    }
    if (!email || !email.trim()) {
      return NextResponse.json({ error: "Email wajib diisi." }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ error: "Password wajib diisi." }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: "Format email tidak valid." }, { status: 400 });
    }

    // Password minimum 8 characters
    if (password.length < 8) {
      return NextResponse.json({ error: "Password minimal 8 karakter." }, { status: 400 });
    }

    // Name max length
    if (name.trim().length > 100) {
      return NextResponse.json({ error: "Nama terlalu panjang (maks. 100 karakter)." }, { status: 400 });
    }

    // Check duplicate email
    const existing = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (existing) {
      return NextResponse.json({ error: "Email sudah terdaftar. Silakan gunakan email lain." }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create PEMINJAM account
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: "PEMINJAM",
        division: "UMUM",         // default division for PEMINJAM
        instansi: instansi?.trim() || null,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        instansi: true,
        createdAt: true,
      },
    });

    // Notify admins about new registrant
    await notifyAdmins(
      "INFO",
      "👤 Peminjam Baru Mendaftar",
      `${newUser.name} (${newUser.email})${instansi ? ` dari ${instansi.trim()}` : ""} telah mendaftar sebagai peminjam.`,
      "/admin/peminjam"
    );

    return NextResponse.json(
      { success: true, message: "Akun berhasil dibuat. Silakan login.", user: newUser },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan saat mendaftar. Coba lagi." },
      { status: 500 }
    );
  }
}
