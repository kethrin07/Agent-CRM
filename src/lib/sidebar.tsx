"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

/**
 * Desktop sidebar collapse state. Persisted in localStorage so the choice
 * sticks across reloads. `mounted` gates the collapsed effect until after
 * hydration, so SSR (always expanded) and the first client render match.
 */

const STORAGE_KEY = "mhq-sidebar-collapsed";

type SidebarStore = {
  collapsed: boolean; // user's stored preference
  mounted: boolean; // false until after hydration
  toggle: () => void;
};

const SidebarContext = createContext<SidebarStore | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {}
    setMounted(true);
  }, []);

  const toggle = useCallback(() => {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {}
      return next;
    });
  }, []);

  return (
    <SidebarContext.Provider value={{ collapsed, mounted, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar(): SidebarStore {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}
