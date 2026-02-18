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
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
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
    const data = archives.map((a: any, i: number) => {
      const base: any = {
        no: i + 1,
        status: a.status,
        divisi: divisionLabels[a.division] || a.division,
        dibuat_oleh: a.user.name,
        tanggal_input: new Date(a.createdAt).toLocaleDateString("id-ID"),
      };

      if (a.status === "AKTIF" && a.noBerkas) {
        base.no_berkas = a.noBerkas;
        base.no_urut = a.noUrut || "-";
        base.kode = a.kode || "-";
        base.index_pekerjaan = a.indexPekerjaan || "-";
        base.uraian_masalah = a.uraianMasalah || "-";
        base.tahun = a.tahun || "-";
        base.jumlah_berkas = a.jumlahBerkas || "-";
        base.keterangan_asli_copy = a.keteranganAsliCopy || "-";
        base.keterangan_box = a.keteranganBox || "-";
      } else if (a.status === "INAKTIF" && a.noItem) {
        base.nomor_berkas = a.noBerkas || "-";
        base.no_item = a.noItem || "-";
        base.kode_klasifikasi = a.kodeKlasifikasi || "-";
        base.indeks = a.indeks || "-";
        base.uraian_informasi = a.uraianInformasi || "-";
        base.kurun_waktu = a.kurunWaktu || "-";
        base.jumlah_berkas = a.jumlahBerkas || "-";
        base.keterangan_asli_kopi = a.keteranganAsliCopy || "-";
        base.keterangan_box = a.keteranganBox || "-";
        base.keterangan_skkaad = a.keteranganSKKAAD || "-";
      } else {
        base.nomor_arsip = a.archiveNumber;
        base.judul = a.title;
        base.nomor_surat = a.letterNumber;
        base.tanggal = new Date(a.date).toLocaleDateString("id-ID");
        base.deskripsi = a.description || "-";
      }

      return base;
    });

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
    "Status",
    "Nomor Arsip/Berkas",
    "No Urut/Item",
    "Kode/Klasifikasi",
    "Judul/Index/Indeks",
    "Uraian Masalah/Informasi",
    "Nomor Surat",
    "Tanggal/Tahun/Kurun Waktu",
    "Divisi",
    "Jumlah Berkas",
    "Asli/Copy/Kopi",
    "Box",
    "SKKAAD",
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

  const rows = archives.map((a: any, i: number) =>
    [
      String(i + 1),
      a.status,
      a.status === "AKTIF" && a.noBerkas ? a.noBerkas : a.status === "INAKTIF" && a.noBerkas ? a.noBerkas : a.archiveNumber,
      a.status === "AKTIF" ? (a.noUrut || "-") : a.status === "INAKTIF" ? (a.noItem || "-") : "-",
      a.status === "AKTIF" && a.kode ? a.kode : a.status === "INAKTIF" && a.kodeKlasifikasi ? a.kodeKlasifikasi : "-",
      a.status === "AKTIF" && a.indexPekerjaan ? a.indexPekerjaan : a.status === "INAKTIF" && a.indeks ? a.indeks : a.title,
      a.status === "AKTIF" ? (a.uraianMasalah || "-") : a.status === "INAKTIF" ? (a.uraianInformasi || "-") : "-",
      a.status !== "AKTIF" && a.status !== "INAKTIF" ? a.letterNumber : "-",
      a.status === "AKTIF" && a.tahun ? a.tahun : a.status === "INAKTIF" && a.kurunWaktu ? a.kurunWaktu : new Date(a.date).toLocaleDateString("id-ID"),
      divisionLabels[a.division] || a.division,
      a.jumlahBerkas || "-",
      a.keteranganAsliCopy || "-",
      a.keteranganBox || "-",
      a.keteranganSKKAAD || "-",
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
