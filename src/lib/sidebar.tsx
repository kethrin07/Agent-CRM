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
 * sticks across reloads. The consumer (Sidebar) gates rendering behind its own
 * local "mounted" flag so SSR (always expanded) and the first client render
 * match — important because the Sidebar sits inside a Suspense boundary and
 * hydrates later than this provider.
 */

const STORAGE_KEY = "mhq-sidebar-collapsed";

type SidebarStore = {
  collapsed: boolean; // user's stored preference
  toggle: () => void;
};

const SidebarContext = createContext<SidebarStore | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {}
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
    <SidebarContext.Provider value={{ collapsed, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar(): SidebarStore {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}
