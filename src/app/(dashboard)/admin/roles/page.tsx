import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import {
  Shield,
  Users,
  Eye,
  Edit3,
  Trash2,
  Check,
  X,
  Crown,
  Settings,
  UserCheck,
} from "lucide-react";

const roles = [
  {
    name: "SUPER_ADMIN",
    label: "Super Admin",
    icon: Crown,
    color: "from-red-500 to-rose-600",
    lightColor: "bg-red-50 text-red-700 border-red-200",
    description: "Full access to the entire system including user management and configuration",
    permissions: {
      "View All Archives": true,
      "Add Archives": true,
      "Edit Archives": true,
      "Delete Archives": true,
      "Manage Users": true,
      "Storage Configuration": true,
      "View All Divisions": true,
      "Activity Log": true,
      "Access Rights": true,
    },
  },
  {
    name: "ADMIN",
    label: "Admin",
    icon: Settings,
    color: "from-blue-500 to-indigo-600",
    lightColor: "bg-blue-50 text-blue-700 border-blue-200",
    description: "Can manage archives across all divisions and access storage configuration",
    permissions: {
      "View All Archives": true,
      "Add Archives": true,
      "Edit Archives": true,
      "Delete Archives": true,
      "Manage Users": false,
      "Storage Configuration": true,
      "View All Divisions": true,
      "Activity Log": true,
      "Access Rights": false,
    },
  },
  {
    name: "USER",
    label: "Staff",
    icon: UserCheck,
    color: "from-gray-500 to-slate-600",
    lightColor: "bg-gray-50 text-gray-700 border-gray-200",
    description: "Can only add and view archives in own division",
    permissions: {
      "View All Archives": false,
      "Add Archives": true,
      "Edit Archives": false,
      "Delete Archives": false,
      "Manage Users": false,
      "Storage Configuration": false,
      "View All Divisions": false,
      "Activity Log": false,
      "Access Rights": false,
    },
  },
];

export default async function RolesPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!user || user.role !== "SUPER_ADMIN") {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-gray-400">You do not have access to this page.</p>
      </div>
    );
  }

  const userCounts = await Promise.all(
    roles.map((r) =>
      prisma.user.count({ where: { role: r.name as any } }).then((count) => ({
        role: r.name,
        count,
      }))
    )
  );

  const countMap = Object.fromEntries(userCounts.map((u) => [u.role, u.count]));

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-xl">
            <Shield size={20} className="text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Access Rights & Roles
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              Manage access rights based on user roles
            </p>
          </div>
        </div>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {roles.map((role) => {
          const RoleIcon = role.icon;
          return (
            <div
              key={role.name}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className={`p-5 bg-gradient-to-r ${role.color}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <RoleIcon size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {role.label}
                      </h3>
                      <p className="text-xs text-white/70">
                        {countMap[role.name] || 0} users
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <p className="text-sm text-gray-500 mb-4">
                  {role.description}
                </p>

                <div className="space-y-2.5">
                  {Object.entries(role.permissions).map(([perm, allowed]) => (
                    <div
                      key={perm}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-600">{perm}</span>
                      {allowed ? (
                        <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <Check size={14} className="text-emerald-600" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 bg-red-50 rounded-lg flex items-center justify-center">
                          <X size={14} className="text-red-400" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Permission Matrix Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Eye size={16} className="text-blue-500" />
            Permission Matrix
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Permission
                </th>
                {roles.map((r) => (
                  <th
                    key={r.name}
                    className="px-5 py-3.5 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider"
                  >
                    <span className={`inline-flex px-2 py-0.5 rounded-lg border text-[10px] ${r.lightColor}`}>
                      {r.label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.keys(roles[0].permissions).map((perm) => (
                <tr
                  key={perm}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-5 py-3 text-sm text-gray-700 font-medium">
                    {perm}
                  </td>
                  {roles.map((r) => (
                    <td key={r.name} className="px-5 py-3 text-center">
                      {r.permissions[perm as keyof typeof r.permissions] ? (
                        <div className="inline-flex w-7 h-7 bg-emerald-100 rounded-lg items-center justify-center">
                          <Check size={14} className="text-emerald-600" />
                        </div>
                      ) : (
                        <div className="inline-flex w-7 h-7 bg-red-50 rounded-lg items-center justify-center">
                          <X size={14} className="text-red-300" />
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
