import { prisma } from "../../../../lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import Link from "next/link";
import { ArrowLeft, Download, Calendar, Hash, FileText, Building2 } from "lucide-react";

const DIVISION_LABELS: Record<string, string> = {
  KEUANGAN: "Keuangan",
  PENYELENGGARA: "Penyelenggara",
  TATA_USAHA: "Tata Usaha",
  UMUM: "Umum",
};

export default async function ArchiveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const archive = await prisma.archive.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true } } },
  });

  if (!archive) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/archives"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft size={16} />
          Kembali ke daftar
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{archive.title}</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailItem
            icon={Hash}
            label="Nomor Arsip"
            value={archive.archiveNumber}
          />
          <DetailItem
            icon={FileText}
            label="Nomor Surat"
            value={archive.letterNumber}
          />
          <DetailItem
            icon={Calendar}
            label="Tanggal"
            value={format(new Date(archive.date), "dd MMMM yyyy", {
              locale: idLocale,
            })}
          />
          <DetailItem
            icon={Building2}
            label="Divisi"
            value={DIVISION_LABELS[archive.division] || archive.division}
          />
        </div>

        {archive.description && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Deskripsi
            </h3>
            <p className="text-gray-700">{archive.description}</p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Dibuat oleh{" "}
            <span className="font-medium text-gray-700">
              {archive.user.name}
            </span>{" "}
            pada{" "}
            {format(new Date(archive.createdAt), "dd MMM yyyy HH:mm", {
              locale: idLocale,
            })}
          </div>
          <a
            href={archive.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Download size={16} />
            Download File
          </a>
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-gray-100 rounded-lg">
        <Icon size={18} className="text-gray-500" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-gray-900 font-medium">{value}</p>
      </div>
    </div>
  );
}
