import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <Sidebar />
      <div className="md:ml-72 flex flex-col min-h-screen">
        <Navbar />
        <main className="p-6 lg:p-8 flex-1">{children}</main>
        <footer className="px-6 lg:px-8 py-4 border-t border-gray-200/60 dark:border-gray-700/60 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm">
          <p className="text-center text-xs text-gray-400 dark:text-gray-500">
            Dibuat Oleh : <span className="font-semibold text-gray-500 dark:text-gray-400">MUH. ULIL AMRI, S.Kom. MTCNA</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
