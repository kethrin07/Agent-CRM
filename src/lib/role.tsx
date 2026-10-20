"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type Role = "admin" | "client";

const STORAGE_KEY = "mhq-role";

type RoleStore = {
  role: Role | null;
  hydrated: boolean;
  setRole: (role: Role) => void;
  logout: () => void;
};

const RoleContext = createContext<RoleStore | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "admin" || saved === "client") setRoleState(saved);
    } catch {}
    setHydrated(true);
  }, []);

  const setRole = useCallback((next: Role) => {
    setRoleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  }, []);

  const logout = useCallback(() => {
    setRoleState(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  return (
    <RoleContext.Provider value={{ role, hydrated, setRole, logout }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole(): RoleStore {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}
