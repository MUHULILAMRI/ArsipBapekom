"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, Loader2 } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";

interface SearchResult {
  id: string;
  title: string;
  archiveNumber: string;
  division: string;
  status: string;
}

const divisionLabels: Record<string, string> = {
  KEUANGAN: "Keuangan",
  PENYELENGGARA: "Penyelenggara",
  TATA_USAHA: "Tata Usaha",
  UMUM: "Umum",
};

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (debounceTimer) clearTimeout(debounceTimer);

    if (!value.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      setShowResults(true);
      try {
        const res = await fetch(
          `/api/archives?search=${encodeURIComponent(value)}&limit=8`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.archives || []);
        }
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    setDebounceTimer(timer);
  };

  const handleResultClick = (id: string) => {
    setShowResults(false);
    setQuery("");
    router.push(`/archives/${id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowResults(false);
    }
  };

  return (
    <header className="sticky top-0 z-20 glass border-b border-white/20 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-lg ml-8 md:ml-0 relative">
          <div className="relative group">
            {searching ? (
              <Loader2
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500 animate-spin"
                size={18}
              />
            ) : (
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
                size={18}
              />
            )}
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => query.trim() && setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
              placeholder="Cari arsip, surat, atau dokumen..."
              className="w-full pl-11 pr-4 py-2.5 bg-white/60 border border-gray-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400/50 focus:bg-white transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Search Results Dropdown */}
          {showResults && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-2xl shadow-black/10 border border-gray-100 overflow-hidden z-50">
              {searching ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2
                    size={20}
                    className="text-blue-500 animate-spin mr-2"
                  />
                  <span className="text-sm text-gray-400">Mencari...</span>
                </div>
              ) : results.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-sm text-gray-400">
                    Tidak ditemukan hasil untuk &quot;{query}&quot;
                  </p>
                </div>
              ) : (
                <div className="max-h-[300px] overflow-y-auto">
                  {results.map((r) => (
                    <button
                      key={r.id}
                      onMouseDown={() => handleResultClick(r.id)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center gap-3 border-b border-gray-50 last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {r.title}
                        </p>
                        <p className="text-xs text-gray-400">
                          {r.archiveNumber} ·{" "}
                          {divisionLabels[r.division] || r.division}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                          r.status === "AKTIF"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {r.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-3 ml-4">
          {/* Notification */}
          <NotificationDropdown />

          {/* Divider */}
          <div className="h-8 w-px bg-gray-200" />

          {/* User */}
          <div
            className="flex items-center gap-3 pl-1 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => router.push("/profile")}
            title="Profil Saya"
          >
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-gray-800">
                {session?.user?.name}
              </p>
              <p className="text-[11px] text-gray-400 flex items-center gap-1 justify-end">
                <Sparkles size={9} />
                {(session?.user as any)?.role === "SUPER_ADMIN"
                  ? "Super Admin"
                  : (session?.user as any)?.role === "ADMIN"
                  ? "Admin"
                  : "Staf"}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20 overflow-hidden">
              {(session?.user as any)?.profileImage ? (
                <img
                  src={(session?.user as any).profileImage}
                  alt={session?.user?.name || ""}
                  className="w-full h-full object-cover"
                />
              ) : (
                session?.user?.name?.charAt(0)?.toUpperCase() || "U"
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
