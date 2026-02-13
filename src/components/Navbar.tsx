"use client";

import { useSession } from "next-auth/react";
import { Bell, Search, Sparkles } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-20 glass border-b border-white/20 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-lg ml-8 md:ml-0">
          <div className="relative group">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Cari arsip, surat, atau dokumen..."
              className="w-full pl-11 pr-4 py-2.5 bg-white/60 border border-gray-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400/50 focus:bg-white transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3 ml-4">
          {/* Notification */}
          <button className="relative p-2.5 text-gray-400 hover:text-gray-700 hover:bg-white/80 rounded-xl transition-all group">
            <Bell size={20} className="group-hover:rotate-12 transition-transform" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full ring-2 ring-white" />
          </button>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-200" />

          {/* User */}
          <div className="flex items-center gap-3 pl-1">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-gray-800">
                {session?.user?.name}
              </p>
              <p className="text-[11px] text-gray-400 flex items-center gap-1 justify-end">
                <Sparkles size={9} />
                {(session?.user as any)?.role === "SUPER_ADMIN"
                  ? "Super Admin"
                  : (session?.user as any)?.role === "ADMIN"
                  ? "Administrator"
                  : "Staff"}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
              {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
