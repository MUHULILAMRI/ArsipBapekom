"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";

interface ThemeConfig {
  id: string;
  mode: string;
  primaryColor: string;
  accentColor: string;
  sidebarStyle: string;
  borderRadius: string;
}

interface ThemeContextType {
  theme: ThemeConfig | null;
  loading: boolean;
  refreshTheme: () => Promise<void>;
  isDark: boolean;
}

const defaultTheme: ThemeConfig = {
  id: "",
  mode: "light",
  primaryColor: "#3b82f6",
  accentColor: "#6366f1",
  sidebarStyle: "dark",
  borderRadius: "rounded",
};

const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  loading: true,
  refreshTheme: async () => {},
  isDark: false,
});

export function useTheme() {
  return useContext(ThemeContext);
}

// Color presets for primary colors
const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
  "#3b82f6": { bg: "bg-blue-500", text: "text-blue-500", ring: "ring-blue-500" },
  "#ef4444": { bg: "bg-red-500", text: "text-red-500", ring: "ring-red-500" },
  "#10b981": { bg: "bg-emerald-500", text: "text-emerald-500", ring: "ring-emerald-500" },
  "#8b5cf6": { bg: "bg-violet-500", text: "text-violet-500", ring: "ring-violet-500" },
  "#f59e0b": { bg: "bg-amber-500", text: "text-amber-500", ring: "ring-amber-500" },
  "#ec4899": { bg: "bg-pink-500", text: "text-pink-500", ring: "ring-pink-500" },
  "#06b6d4": { bg: "bg-cyan-500", text: "text-cyan-500", ring: "ring-cyan-500" },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);
  const [loading, setLoading] = useState(true);

  const fetchTheme = useCallback(async () => {
    try {
      const res = await fetch("/api/theme");
      if (res.ok) {
        const data = await res.json();
        setTheme(data);
      }
    } catch {
      // Use default theme on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchTheme();
    } else {
      setLoading(false);
    }
  }, [session?.user, fetchTheme]);

  // Determine if dark mode
  const isDark =
    theme.mode === "dark" ||
    (theme.mode === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;

    // Dark mode class
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Set CSS custom properties
    root.style.setProperty("--theme-primary", theme.primaryColor);
    root.style.setProperty("--theme-accent", theme.accentColor);

    // Border radius
    const radiusMap: Record<string, string> = {
      sharp: "0.375rem",
      rounded: "1rem",
      pill: "9999px",
    };
    root.style.setProperty("--theme-radius", radiusMap[theme.borderRadius] || "1rem");
  }, [theme, isDark]);

  // Listen for system dark mode changes
  useEffect(() => {
    if (theme.mode !== "system") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (mq.matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme.mode]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        loading,
        refreshTheme: fetchTheme,
        isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
