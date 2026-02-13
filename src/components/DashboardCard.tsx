import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  gradient?: string;
}

export default function DashboardCard({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  gradient,
}: DashboardCardProps) {
  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 p-6 card-hover overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className={`absolute inset-0 opacity-[0.03] bg-gradient-to-br ${gradient || "from-blue-500 to-indigo-500"} group-hover:opacity-[0.06] transition-opacity`} />
      
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-4xl font-bold text-gray-900 mt-2 tracking-tight">
            {value}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <div className={`w-1.5 h-1.5 rounded-full ${bgColor}`} />
            <span className="text-xs text-gray-400">dokumen</span>
          </div>
        </div>
        <div className={`p-3 rounded-2xl ${bgColor} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={color} size={24} />
        </div>
      </div>
    </div>
  );
}
