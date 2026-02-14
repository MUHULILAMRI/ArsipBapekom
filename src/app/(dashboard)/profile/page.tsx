"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  User,
  Mail,
  Shield,
  Building2,
  Calendar,
  Loader2,
  Save,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  KeyRound,
  Sparkles,
  FileText,
  Clock,
  ShieldCheck,
  Pen,
  CircleCheck,
  Camera,
  Upload,
  Trash2,
} from "lucide-react";
import { useToast } from "../../../components/Toast";

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  USER: "Staff",
};

const roleDescriptions: Record<string, string> = {
  SUPER_ADMIN: "Full access to all features and divisions",
  ADMIN: "Manage archives across all divisions and storage",
  USER: "Input & view archives in own division",
};

const roleColors: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  SUPER_ADMIN: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    gradient: "from-red-500 to-rose-600",
  },
  ADMIN: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    gradient: "from-blue-500 to-indigo-600",
  },
  USER: {
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
    gradient: "from-slate-500 to-gray-600",
  },
};

const divisionLabels: Record<string, string> = {
  KEUANGAN: "Finance",
  PENYELENGGARA: "Operations",
  TATA_USAHA: "Administration",
  UMUM: "General",
};

const divisionIcons: Record<string, string> = {
  KEUANGAN: "💰",
  PENYELENGGARA: "📋",
  TATA_USAHA: "✏️",
  UMUM: "🏢",
};

const allDivisions = [
  { value: "KEUANGAN", label: "Finance", icon: "💰", description: "Manage financial archives" },
  { value: "PENYELENGGARA", label: "Operations", icon: "📋", description: "Manage operational archives" },
  { value: "TATA_USAHA", label: "Administration", icon: "✏️", description: "Manage administrative archives" },
  { value: "UMUM", label: "General", icon: "🏢", description: "Manage general archives" },
];

interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
  division: string;
  profileImage?: string | null;
  createdAt: string;
  _count: { archives: number };
}

export default function ProfilePage() {
  const { data: session, status: sessionStatus, update } = useSession();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "avatar" | "name" | "email" | "division" | "password">("info");

  // Edit name
  const [editName, setEditName] = useState("");
  const [savingName, setSavingName] = useState(false);

  // Edit email
  const [editEmail, setEditEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  // Edit division
  const [editDivision, setEditDivision] = useState("");
  const [savingDivision, setSavingDivision] = useState(false);

  // Avatar
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Change password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const profileLoadedRef = useRef(false);

  useEffect(() => {
    if (sessionStatus === "authenticated" && !profileLoadedRef.current) {
      profileLoadedRef.current = true;
      fetchProfile();
    } else if (sessionStatus === "unauthenticated") {
      setLoading(false);
      setError("You are not logged in. Please sign in first.");
    }
  }, [sessionStatus]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setEditName(data.name);
        setEditEmail(data.email);
        setEditDivision(data.division);
        setAvatarPreview(data.profileImage || null);
      } else {
        const errData = await res.json().catch(() => null);
        setError(errData?.error || "Failed to load profile. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    setSavingName(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update name");
      }
      // Update local state directly from API response (no full page reload)
      setProfile(prev => prev ? { ...prev, name: data.name } : prev);
      setEditName(data.name);
      showToast("success", "Name updated successfully");
      await update({ name: data.name });
    } catch (err: any) {
      showToast("error", "Failed to update name", err.message);
    } finally {
      setSavingName(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEmail.trim()) return;
    setSavingEmail(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: editEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update email");
      }
      setProfile(prev => prev ? { ...prev, email: data.email } : prev);
      setEditEmail(data.email);
      showToast("success", "Email updated successfully");
      await update({ email: data.email });
    } catch (err: any) {
      showToast("error", "Failed to update email", err.message);
    } finally {
      setSavingEmail(false);
    }
  };

  const handleUpdateDivision = async (div: string) => {
    if (div === profile?.division) return;
    setSavingDivision(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ division: div }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update division");
      }
      setProfile(prev => prev ? { ...prev, division: data.division } : prev);
      setEditDivision(data.division);
      showToast("success", "Division updated successfully");
      await update({ division: data.division });
    } catch (err: any) {
      showToast("error", "Failed to update division", err.message);
    } finally {
      setSavingDivision(false);
    }
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("error", "Invalid format", "Only image files are allowed.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast("error", "File too large", "Maximum 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 256;
        let w = img.width, h = img.height;
        if (w > h) { h = (h / w) * MAX; w = MAX; }
        else { w = (w / h) * MAX; h = MAX; }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setAvatarPreview(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = async () => {
    setSavingAvatar(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileImage: avatarPreview }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save photo");
      }
      setProfile(prev => prev ? { ...prev, profileImage: data.profileImage } : prev);
      showToast("success", "Profile photo updated successfully");
      await update({ profileImage: data.profileImage });
    } catch (err: any) {
      showToast("error", "Failed to save photo", err.message);
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setSavingAvatar(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileImage: null }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to remove photo");
      }
      setAvatarPreview(null);
      setProfile(prev => prev ? { ...prev, profileImage: null } : prev);
      showToast("success", "Profile photo removed");
      await update({ profileImage: null });
    } catch (err: any) {
      showToast("error", "Failed to remove photo", err.message);
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("error", "Passwords do not match", "New password and confirmation must be the same.");
      return;
    }
    if (newPassword.length < 6) {
      showToast("error", "Password too short", "Minimum 6 characters.");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      showToast("success", "Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      showToast("error", "Failed to change password", err.message);
    } finally {
      setSavingPassword(false);
    }
  };

  const getPasswordStrength = (pw: string) => {
    if (!pw) return { level: 0, label: "", color: "" };
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (score <= 1) return { level: 1, label: "Weak", color: "bg-red-500" };
    if (score <= 2) return { level: 2, label: "Fair", color: "bg-amber-500" };
    if (score <= 3) return { level: 3, label: "Good", color: "bg-blue-500" };
    return { level: 4, label: "Strong", color: "bg-emerald-500" };
  };

  const pwStrength = getPasswordStrength(newPassword);
  const avatarChanged = avatarPreview !== (profile?.profileImage || null);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-fade-in-up">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-4">
          <Loader2 size={28} className="text-blue-500 animate-spin" />
        </div>
        <p className="text-gray-400 text-sm font-medium">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-fade-in-up">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center mb-4">
          <AlertCircle size={28} className="text-red-500" />
        </div>
        <p className="text-gray-600 text-sm font-medium mb-2">
          {error || "Unable to load profile"}
        </p>
        <button
          onClick={fetchProfile}
          className="mt-3 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-xl shadow-md shadow-blue-200 hover:from-blue-700 hover:to-indigo-700 transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  const rColor = roleColors[profile.role] || roleColors.USER;
  const memberSince = new Date(profile.createdAt);
  const daysSinceJoin = Math.floor((Date.now() - memberSince.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="max-w-5xl mx-auto animate-fade-in-up">
      {/* HERO PROFILE CARD */}
      <div className="relative bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="h-36 sm:h-44 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute top-10 right-20 w-20 h-20 bg-white/5 rounded-full" />
          <div className="absolute -bottom-4 left-10 w-32 h-32 bg-white/5 rounded-full" />
          <div className="absolute bottom-6 right-40 w-12 h-12 bg-white/10 rounded-full" />
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "24px 24px"
          }} />
        </div>

        <div className="px-6 sm:px-10 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 -mt-12 sm:-mt-14 mb-8">
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl sm:text-4xl shadow-2xl shadow-blue-500/30 border-[5px] border-white ring-1 ring-gray-100 transition-transform group-hover:scale-[1.02] overflow-hidden">
                {profile.profileImage ? (
                  <img src={profile.profileImage} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  profile.name?.charAt(0)?.toUpperCase() || "U"
                )}
              </div>
              <button
                onClick={() => setActiveTab("avatar")}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer"
                title="Change profile photo"
              >
                <Camera size={14} className="text-gray-600" />
              </button>
            </div>

            <div className="flex-1 sm:pb-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{profile.name}</h1>
              <p className="text-gray-500 text-sm mt-1 flex items-center gap-1.5">
                <Mail size={14} />
                {profile.email}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${rColor.bg} ${rColor.text} ${rColor.border}`}>
                  <Sparkles size={11} />
                  {roleLabels[profile.role] || profile.role}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span>{divisionIcons[profile.division] || "🏢"}</span>
                  {divisionLabels[profile.division] || profile.division}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200">
                  <Clock size={11} />
                  {daysSinceJoin} days member
                </span>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <div className="text-center px-5 py-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                <p className="text-2xl font-bold text-blue-600">{profile._count.archives}</p>
                <p className="text-[10px] text-blue-500 font-semibold uppercase tracking-wider mt-0.5">Archives</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="group flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50/80 to-indigo-50/50 rounded-2xl border border-blue-100/60 hover:border-blue-200 transition-all hover:shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mail size={18} className="text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-blue-400 uppercase font-semibold tracking-wider">Email</p>
                <p className="text-sm font-semibold text-gray-800 truncate">{profile.email}</p>
              </div>
            </div>
            <div className="group flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50/80 to-fuchsia-50/50 rounded-2xl border border-purple-100/60 hover:border-purple-200 transition-all hover:shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield size={18} className="text-purple-600" />
              </div>
              <div>
                <p className="text-[10px] text-purple-400 uppercase font-semibold tracking-wider">Role</p>
                <p className="text-sm font-semibold text-gray-800">{roleLabels[profile.role] || profile.role}</p>
              </div>
            </div>
            <div className="group flex items-center gap-3 p-4 bg-gradient-to-br from-emerald-50/80 to-teal-50/50 rounded-2xl border border-emerald-100/60 hover:border-emerald-200 transition-all hover:shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText size={18} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] text-emerald-400 uppercase font-semibold tracking-wider">Total Archives</p>
                <p className="text-sm font-semibold text-gray-800">{profile._count.archives} documents</p>
              </div>
            </div>
            <div className="group flex items-center gap-3 p-4 bg-gradient-to-br from-amber-50/80 to-yellow-50/50 rounded-2xl border border-amber-100/60 hover:border-amber-200 transition-all hover:shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar size={18} className="text-amber-600" />
              </div>
              <div>
                <p className="text-[10px] text-amber-400 uppercase font-semibold tracking-wider">Joined</p>
                <p className="text-sm font-semibold text-gray-800">
                  {memberSince.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-1 p-1 bg-gray-100/80 rounded-2xl mb-6 overflow-x-auto">
        {[
          { key: "info" as const, label: "Information", icon: User },
          { key: "avatar" as const, label: "Profile Photo", icon: Camera },
          { key: "name" as const, label: "Change Name", icon: Pen },
          { key: "email" as const, label: "Change Email", icon: Mail },
          { key: "division" as const, label: "Change Division", icon: Building2 },
          { key: "password" as const, label: "Change Password", icon: KeyRound },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
            }`}
          >
            <tab.icon size={15} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB: INFO */}
      {activeTab === "info" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className={`px-6 py-4 bg-gradient-to-r ${rColor.gradient} flex items-center gap-3`}>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">{roleLabels[profile.role] || profile.role}</h3>
                <p className="text-xs text-white/70">{roleDescriptions[profile.role] || ""}</p>
              </div>
            </div>
            <div className="p-6">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Your Permissions</h4>
              <div className="space-y-3">
                {[
                  { label: "View archives", allowed: true },
                  { label: "Create new archives", allowed: true },
                  { label: "Edit archives", allowed: profile.role !== "USER" },
                  { label: "Delete archives", allowed: profile.role !== "USER" },
                  { label: "View all divisions", allowed: profile.role !== "USER" },
                  { label: "Manage users", allowed: profile.role === "SUPER_ADMIN" },
                  { label: "Manage storage", allowed: profile.role !== "USER" },
                ].map((perm, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${perm.allowed ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-300"}`}>
                      {perm.allowed ? <CheckCircle size={14} /> : <span className="text-xs">—</span>}
                    </div>
                    <span className={`text-sm ${perm.allowed ? "text-gray-700 font-medium" : "text-gray-400"}`}>{perm.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Building2 size={14} />Division
              </h4>
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-2xl">
                  {divisionIcons[profile.division] || "🏢"}
                </div>
                <div>
                  <p className="text-base font-bold text-gray-900">{divisionLabels[profile.division] || profile.division}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{profile._count.archives} archives recorded in this division</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <User size={14} />Account Details
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">Name</span>
                  <span className="text-sm font-semibold text-gray-800">{profile.name}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">Email</span>
                  <span className="text-sm font-semibold text-gray-800">{profile.email}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">Account ID</span>
                  <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{profile.id.slice(0, 8)}...</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-500">Registered</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {memberSince.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: AVATAR */}
      {activeTab === "avatar" && (
        <div className="max-w-xl animate-fade-in-up">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-violet-100/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                  <Camera size={18} className="text-violet-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Profile Photo</h3>
                  <p className="text-xs text-gray-500">Upload your profile photo (max 2MB, JPG/PNG format)</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-5xl shadow-2xl shadow-blue-500/20 border-4 border-white ring-1 ring-gray-100 overflow-hidden">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      profile.name?.charAt(0)?.toUpperCase() || "U"
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  >
                    <Camera size={24} className="text-white drop-shadow-md" />
                  </button>
                </div>
                {avatarChanged && (
                  <p className="text-xs text-violet-500 mt-3 flex items-center gap-1">
                    <CircleCheck size={12} />
                    New photo preview — click save to apply
                  </p>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarSelect}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-violet-300 hover:bg-violet-50/30 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-violet-100 flex items-center justify-center mx-auto mb-3 transition-colors">
                  <Upload size={20} className="text-gray-400 group-hover:text-violet-500 transition-colors" />
                </div>
                <p className="text-sm font-medium text-gray-700">Click to select a photo</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG or WebP • Max 2MB</p>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleSaveAvatar}
                  disabled={savingAvatar || !avatarChanged}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-violet-700 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30 active:scale-[0.98]"
                >
                  {savingAvatar ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Photo
                </button>
                {profile.profileImage && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={savingAvatar}
                    className="inline-flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium disabled:opacity-40"
                  >
                    <Trash2 size={16} />
                    Remove Photo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: EDIT NAME */}
      {activeTab === "name" && (
        <div className="max-w-xl animate-fade-in-up">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Pen size={18} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Change Display Name</h3>
                  <p className="text-xs text-gray-500">This name will be displayed throughout the application</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <form onSubmit={handleUpdateName} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
                    />
                  </div>
                  {editName !== profile.name && editName.trim() && (
                    <p className="text-xs text-blue-500 mt-2 flex items-center gap-1">
                      <CircleCheck size={12} />
                      Name will be changed to &quot;{editName.trim()}&quot;
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={savingName || !editName.trim() || editName === profile.name}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98]"
                  >
                    {savingName ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save Changes
                  </button>
                  {editName !== profile.name && (
                    <button type="button" onClick={() => setEditName(profile.name)} className="px-4 py-3 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB: EDIT EMAIL */}
      {activeTab === "email" && (
        <div className="max-w-xl animate-fade-in-up">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-cyan-100/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
                  <Mail size={18} className="text-cyan-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Change Email Address</h3>
                  <p className="text-xs text-gray-500">Email is used for application login</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <form onSubmit={handleUpdateEmail} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Current Email</label>
                  <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                    <Mail size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-500">{profile.email}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">New Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="Enter new email"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 focus:bg-white transition-all"
                    />
                  </div>
                  {editEmail !== profile.email && editEmail.trim() && (
                    <p className="text-xs text-cyan-500 mt-2 flex items-center gap-1">
                      <CircleCheck size={12} />
                      Email will be changed to &quot;{editEmail.trim()}&quot;
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={savingEmail || !editEmail.trim() || editEmail === profile.email}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl text-sm font-semibold hover:from-cyan-700 hover:to-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30 active:scale-[0.98]"
                  >
                    {savingEmail ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save Email
                  </button>
                  {editEmail !== profile.email && (
                    <button type="button" onClick={() => setEditEmail(profile.email)} className="px-4 py-3 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle size={16} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-800">Warning</p>
              <p className="text-xs text-amber-600 mt-0.5 leading-relaxed">
                After changing your email, you will need to log in again using the new email.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB: EDIT DIVISION */}
      {activeTab === "division" && (
        <div className="max-w-xl animate-fade-in-up">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Building2 size={18} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Change Division</h3>
                  <p className="text-xs text-gray-500">Select the division where you work</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-4">
                Current division: <span className="text-emerald-600">{divisionLabels[profile.division]}</span>
              </p>
              <div className="space-y-3">
                {allDivisions.map((div) => {
                  const isActive = profile.division === div.value;
                  const isSelected = editDivision === div.value;
                  return (
                    <button
                      key={div.value}
                      type="button"
                      onClick={() => {
                        setEditDivision(div.value);
                        if (div.value !== profile.division) handleUpdateDivision(div.value);
                      }}
                      disabled={savingDivision}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                        isActive
                          ? "border-emerald-300 bg-emerald-50/50 ring-1 ring-emerald-200"
                          : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                      } ${savingDivision ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${isActive ? "bg-emerald-100" : "bg-gray-100"}`}>
                        {div.icon}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${isActive ? "text-emerald-700" : "text-gray-800"}`}>{div.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{div.description}</p>
                      </div>
                      {isActive && (
                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                          <CheckCircle size={14} className="text-white" />
                        </div>
                      )}
                      {savingDivision && isSelected && !isActive && (
                        <Loader2 size={18} className="text-emerald-500 animate-spin" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: CHANGE PASSWORD */}
      {activeTab === "password" && (
        <div className="max-w-xl animate-fade-in-up">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <KeyRound size={18} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Change Password</h3>
                  <p className="text-xs text-gray-500">Make sure your new password is strong and easy to remember</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <form onSubmit={handleChangePassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 focus:bg-white transition-all"
                    />
                    <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors">
                      {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100" /></div>
                  <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-gray-400 font-medium">New Password</span></div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                  <div className="relative">
                    <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showNewPw ? "text" : "password"}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 focus:bg-white transition-all"
                    />
                    <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors">
                      {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {newPassword && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-gray-400">Password strength</span>
                        <span className={`text-xs font-semibold ${pwStrength.level <= 1 ? "text-red-500" : pwStrength.level <= 2 ? "text-amber-500" : pwStrength.level <= 3 ? "text-blue-500" : "text-emerald-500"}`}>{pwStrength.label}</span>
                      </div>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= pwStrength.level ? pwStrength.color : "bg-gray-100"}`} />
                        ))}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                        {[
                          { check: newPassword.length >= 6, label: "Min. 6 characters" },
                          { check: /[A-Z]/.test(newPassword), label: "Uppercase" },
                          { check: /[0-9]/.test(newPassword), label: "Number" },
                          { check: /[^A-Za-z0-9]/.test(newPassword), label: "Symbol" },
                        ].map((req, i) => (
                          <span key={i} className={`text-[11px] flex items-center gap-1 ${req.check ? "text-emerald-500" : "text-gray-400"}`}>
                            {req.check ? <CheckCircle size={11} /> : <span className="w-[11px] h-[11px] rounded-full border border-gray-300 inline-block" />}
                            {req.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showConfirmPw ? "text" : "password"}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className={`w-full pl-11 pr-12 py-3.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 focus:bg-white transition-all ${
                        confirmPassword && confirmPassword !== newPassword
                          ? "border-red-300 bg-red-50/30"
                          : confirmPassword && confirmPassword === newPassword
                          ? "border-emerald-300 bg-emerald-50/30"
                          : "border-gray-200"
                      }`}
                    />
                    <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors">
                      {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle size={12} />Passwords do not match</p>
                  )}
                  {confirmPassword && confirmPassword === newPassword && (
                    <p className="text-xs text-emerald-500 mt-1.5 flex items-center gap-1"><CheckCircle size={12} />Passwords match</p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingPassword || !currentPassword || !newPassword || newPassword.length < 6 || newPassword !== confirmPassword}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-semibold hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 active:scale-[0.98]"
                  >
                    {savingPassword ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                    Change Password
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
              <Shield size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-800">Security Tips</p>
              <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">
                Use a combination of uppercase, lowercase, numbers, and symbols for a strong password. Do not reuse passwords from other accounts.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
