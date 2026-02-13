"use client";

import { useEffect, useState } from "react";
import {
  UserPlus,
  Loader2,
  Users,
  Shield,
  Building2,
  Archive,
  X,
  Check,
  AlertCircle,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  division: string;
  createdAt: string;
  _count: { archives: number };
}

const ROLES = ["SUPER_ADMIN", "ADMIN", "USER"];
const DIVISIONS = [
  { value: "KEUANGAN", label: "Keuangan" },
  { value: "PENYELENGGARA", label: "Penyelenggara" },
  { value: "TATA_USAHA", label: "Tata Usaha" },
  { value: "UMUM", label: "Umum" },
];

const roleConfig: Record<string, { label: string; color: string; icon: string }> = {
  SUPER_ADMIN: {
    label: "Super Admin",
    color: "bg-red-50 text-red-700 border-red-200",
    icon: "🛡️",
  },
  ADMIN: {
    label: "Admin",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: "⚙️",
  },
  USER: {
    label: "Staff",
    color: "bg-gray-50 text-gray-700 border-gray-200",
    icon: "👤",
  },
};

const divisionColors: Record<string, string> = {
  KEUANGAN: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENYELENGGARA: "bg-blue-50 text-blue-700 border-blue-200",
  TATA_USAHA: "bg-amber-50 text-amber-700 border-amber-200",
  UMUM: "bg-purple-50 text-purple-700 border-purple-200",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
    division: "KEUANGAN",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal membuat user");
      }

      setShowForm(false);
      setForm({
        name: "",
        email: "",
        password: "",
        role: "USER",
        division: "KEUANGAN",
      });
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-fade-in-up">
        <Loader2 size={32} className="text-blue-500 animate-spin mb-4" />
        <p className="text-gray-400 text-sm">Memuat data pengguna...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-xl">
            <Users size={20} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Kelola User
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {users.length} pengguna terdaftar
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300"
        >
          {showForm ? <X size={16} /> : <UserPlus size={16} />}
          {showForm ? "Batal" : "Tambah User"}
        </button>
      </div>

      {/* Add User Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8 shadow-sm animate-fade-in-up">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <UserPlus size={18} className="text-blue-600" />
            User Baru
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm flex items-center gap-3">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Masukkan nama..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@contoh.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="Minimal 6 karakter"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {roleConfig[r]?.label || r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Divisi
                </label>
                <select
                  value={form.division}
                  onChange={(e) =>
                    setForm({ ...form, division: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                >
                  {DIVISIONS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      Simpan User
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Users size={18} className="text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
          <p className="text-xs text-gray-400 mt-1">Total User</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-red-50 rounded-xl">
              <Shield size={18} className="text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {users.filter((u) => u.role === "SUPER_ADMIN" || u.role === "ADMIN").length}
          </p>
          <p className="text-xs text-gray-400 mt-1">Admin</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-emerald-50 rounded-xl">
              <Building2 size={18} className="text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {new Set(users.map((u) => u.division)).size}
          </p>
          <p className="text-xs text-gray-400 mt-1">Divisi Aktif</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-amber-50 rounded-xl">
              <Archive size={18} className="text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {users.reduce((sum, u) => sum + u._count.archives, 0)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Total Arsip</p>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u, index) => (
          <div
            key={u.id}
            className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all hover:border-gray-200 group"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-200/50">
                  {u.name?.charAt(0).toUpperCase() || "?"}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {u.name}
                  </h3>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                  roleConfig[u.role]?.color || "bg-gray-50 text-gray-700 border-gray-200"
                }`}
              >
                <span>{roleConfig[u.role]?.icon}</span>
                {roleConfig[u.role]?.label || u.role}
              </span>
              <span
                className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium border ${
                  divisionColors[u.division] || "bg-gray-50 text-gray-600 border-gray-200"
                }`}
              >
                {DIVISIONS.find((d) => d.value === u.division)?.label ||
                  u.division}
              </span>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Archive size={14} />
                <span>{u._count.archives} arsip</span>
              </div>
              <p className="text-xs text-gray-300">
                {new Date(u.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-4 bg-gray-50 rounded-2xl inline-block mb-4">
            <Users size={32} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Belum Ada User
          </h3>
          <p className="text-sm text-gray-400">
            Klik tombol &quot;Tambah User&quot; untuk menambahkan pengguna baru
          </p>
        </div>
      )}
    </div>
  );
}
