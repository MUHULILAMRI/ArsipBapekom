import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser, canAccessDivision } from "../../../../lib/rbac";

const divisionLabels: Record<string, string> = {
  KEUANGAN: "Keuangan",
  PENYELENGGARA: "Penyelenggara",
  TATA_USAHA: "Tata Usaha",
  UMUM: "Umum",
};

// GET /api/archives/export?format=csv|json&division=...&status=...
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "csv";
  const division = searchParams.get("division");
  const status = searchParams.get("status");

  const where: any = {};

  // RBAC
  if (user.role === "USER") {
    where.division = user.division;
  } else if (division) {
    where.division = division;
  }

  if (status === "AKTIF" || status === "INAKTIF") {
    where.status = status;
  }

  const archives = await prisma.archive.findMany({
    where,
    orderBy: { date: "desc" },
    include: {
      user: { select: { name: true } },
    },
  });

  if (format === "json") {
    const data = archives.map((a, i) => ({
      no: i + 1,
      nomor_arsip: a.archiveNumber,
      judul: a.title,
      nomor_surat: a.letterNumber,
      tanggal: new Date(a.date).toLocaleDateString("id-ID"),
      divisi: divisionLabels[a.division] || a.division,
      status: a.status,
      deskripsi: a.description || "-",
      dibuat_oleh: a.user.name,
      tanggal_input: new Date(a.createdAt).toLocaleDateString("id-ID"),
    }));

    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="arsip-bapekom-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  }

  // CSV format
  const BOM = "\uFEFF"; // UTF-8 BOM for Excel compatibility
  const headers = [
    "No",
    "Nomor Arsip",
    "Judul",
    "Nomor Surat",
    "Tanggal",
    "Divisi",
    "Status",
    "Deskripsi",
    "Dibuat Oleh",
    "Tanggal Input",
  ];

  const escapeCSV = (val: string) => {
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const rows = archives.map((a, i) =>
    [
      String(i + 1),
      a.archiveNumber,
      a.title,
      a.letterNumber,
      new Date(a.date).toLocaleDateString("id-ID"),
      divisionLabels[a.division] || a.division,
      a.status,
      a.description || "-",
      a.user.name,
      new Date(a.createdAt).toLocaleDateString("id-ID"),
    ]
      .map(escapeCSV)
      .join(",")
  );

  const csv = BOM + [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="arsip-bapekom-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
