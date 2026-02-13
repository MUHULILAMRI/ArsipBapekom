import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import ArchiveForm from "../../../../components/ArchiveForm";
import { FilePlus2 } from "lucide-react";

export default async function CreateArchivePage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-blue-100 rounded-xl">
            <FilePlus2 size={20} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Tambah Arsip Baru
          </h1>
        </div>
        <p className="text-gray-500 mt-1 ml-12">
          Isi form di bawah untuk menambahkan arsip baru ke sistem
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <ArchiveForm userDivision={user?.division} userRole={user?.role} />
      </div>
    </div>
  );
}
