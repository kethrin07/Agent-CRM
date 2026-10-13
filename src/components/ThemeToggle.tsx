"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "./icons";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTheme(
      document.documentElement.classList.contains("dark") ? "dark" : "light",
    );
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("theme", next);
    } catch {}
  };

  const isDark = theme === "dark";
  const label = isDark ? "Light mode" : "Dark mode";
  // Render a stable icon until mounted to avoid hydration mismatch.
  const icon = !mounted ? <MoonIcon /> : isDark ? <SunIcon /> : <MoonIcon />;

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label={label}
        title={label}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-strong bg-card text-ink transition-colors hover:bg-hover"
      >
        {icon}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      className="mb-2 flex w-full items-center gap-2.5 rounded-lg border border-border-strong bg-card p-3 text-sm font-medium text-ink transition-colors hover:bg-hover"
    >
      {icon}
      {label}
    </button>
  );
}
