"use client";

import { useState, useEffect } from "react";
import { Clock, Calendar } from "lucide-react";

export default function RealtimeClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 animate-pulse">
        <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded-xl" />
      </div>
    );
  }

  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];

  const dayName = days[time.getDay()];
  const date = time.getDate();
  const month = months[time.getMonth()];
  const year = time.getFullYear();
  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 text-white shadow-xl shadow-blue-900/10">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Time */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 rounded-xl backdrop-blur-sm">
            <Clock size={24} className="text-blue-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl sm:text-5xl font-bold tracking-tight font-mono tabular-nums">
                {hours}:{minutes}
              </span>
              <span className="text-xl sm:text-2xl font-semibold text-blue-300/70 font-mono tabular-nums">
                :{seconds}
              </span>
            </div>
            <p className="text-xs text-blue-300/50 mt-1 uppercase tracking-widest">
              Waktu Indonesia
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-16 bg-gradient-to-b from-transparent via-blue-500/30 to-transparent" />

        {/* Date */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/20 rounded-xl backdrop-blur-sm">
            <Calendar size={24} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-lg sm:text-xl font-semibold">{dayName}</p>
            <p className="text-sm text-blue-200/60">
              {date} {month} {year}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
