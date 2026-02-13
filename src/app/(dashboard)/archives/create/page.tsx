import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import ArchiveForm from "../../../../components/ArchiveForm";

export default async function CreateArchivePage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tambah Arsip Baru</h1>
        <p className="text-gray-500 mt-1">
          Isi form di bawah untuk menambahkan arsip baru
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <ArchiveForm userDivision={user?.division} userRole={user?.role} />
      </div>
    </div>
  );
}
