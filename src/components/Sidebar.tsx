"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Archive,
  Users,
  HardDrive,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  BarChart3,
  ClipboardList,
  Shield,
  FolderOpen,
} from "lucide-react";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["SUPER_ADMIN", "ADMIN", "USER"], group: "menu" },
  { name: "Arsip", href: "/archives", icon: Archive, roles: ["SUPER_ADMIN", "ADMIN", "USER"], group: "menu" },
  { name: "Jelajahi Arsip", href: "/archives/browse", icon: FolderOpen, roles: ["SUPER_ADMIN", "ADMIN", "USER"], group: "menu" },
  { name: "Analisis", href: "/analytics", icon: BarChart3, roles: ["SUPER_ADMIN", "ADMIN", "USER"], group: "menu" },
  { name: "Kelola User", href: "/admin/users", icon: Users, roles: ["SUPER_ADMIN"], group: "admin" },
  { name: "Log Aktivitas", href: "/admin/activity", icon: ClipboardList, roles: ["SUPER_ADMIN", "ADMIN"], group: "admin" },
  { name: "Hak Akses", href: "/admin/roles", icon: Shield, roles: ["SUPER_ADMIN"], group: "admin" },
  { name: "Storage", href: "/admin/storage", icon: HardDrive, roles: ["SUPER_ADMIN", "ADMIN"], group: "admin" },
];

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  USER: "Staff",
};

const divisionLabels: Record<string, string> = {
  KEUANGAN: "Keuangan",
  PENYELENGGARA: "Penyelenggara",
  TATA_USAHA: "Tata Usaha",
  UMUM: "Umum",
};

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const userRole = (session?.user as any)?.role || "USER";
  const userDivision = (session?.user as any)?.division || "";

  const filteredNav = navigation.filter((item) => item.roles.includes(userRole));

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-white/90 backdrop-blur-sm p-2.5 rounded-xl shadow-lg border border-gray-200/50"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={20} className="text-gray-700" /> : <Menu size={20} className="text-gray-700" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl" />
          <div className="absolute bottom-20 left-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl" />

          {/* Logo */}
          <div className="relative flex items-center gap-3 px-6 py-6">
            <div className="flex items-center justify-center w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20">
              <Archive className="text-white" size={22} />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">
                Arsip Bapekom
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <Sparkles size={10} className="text-blue-400" />
                <span className="text-[10px] font-medium text-blue-400/70 uppercase tracking-widest">
                  Digital Archive
                </span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-5 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

          {/* Navigation */}
          <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
            <p className="px-3 mb-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              Menu Utama
            </p>
            {filteredNav.filter((item) => item.group === "menu").map((item, index) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 animate-slide-in-left ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/10 text-white shadow-sm"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div
                    className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all ${
                      isActive
                        ? "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/20"
                        : "bg-slate-800 group-hover:bg-slate-700"
                    }`}
                  >
                    <item.icon size={18} />
                  </div>
                  <span className="flex-1">{item.name}</span>
                  {isActive && (
                    <ChevronRight size={14} className="text-blue-400" />
                  )}
                </Link>
              );
            })}

            {filteredNav.some((item) => item.group === "admin") && (
              <>
                <div className="pt-4 pb-2">
                  <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                    Administrasi
                  </p>
                </div>
                {filteredNav.filter((item) => item.group === "admin").map((item, index) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 animate-slide-in-left ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/10 text-white shadow-sm"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                      style={{ animationDelay: `${(index + 3) * 0.05}s` }}
                    >
                      <div
                        className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all ${
                          isActive
                            ? "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/20"
                            : "bg-slate-800 group-hover:bg-slate-700"
                        }`}
                      >
                        <item.icon size={18} />
                      </div>
                      <span className="flex-1">{item.name}</span>
                      {isActive && (
                        <ChevronRight size={14} className="text-blue-400" />
                      )}
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          {/* User Info */}
          <div className="relative p-4">
            <div className="mx-1 mb-3 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
            <div className="bg-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
                  {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {session?.user?.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/20 text-blue-300">
                      {roleLabels[userRole] || userRole}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {divisionLabels[userDivision] || userDivision}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 group"
              >
                <LogOut size={16} className="group-hover:rotate-[-12deg] transition-transform" />
                Keluar
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
