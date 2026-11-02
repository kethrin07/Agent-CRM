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
const CLIENT_KEY = "mhq-client-id";

type RoleStore = {
  role: Role | null;
  clientId: string | null; // which tenant, when role === "client"
  hydrated: boolean;
  setRole: (role: Role, clientId?: string | null) => void;
  logout: () => void;
};

const RoleContext = createContext<RoleStore | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "admin" || saved === "client") setRoleState(saved);
      const savedClient = localStorage.getItem(CLIENT_KEY);
      if (savedClient) setClientId(savedClient);
    } catch {}
    setHydrated(true);
  }, []);

  const setRole = useCallback(
    (next: Role, nextClient: string | null = null) => {
      setRoleState(next);
      const cid = next === "client" ? nextClient : null;
      setClientId(cid);
      try {
        localStorage.setItem(STORAGE_KEY, next);
        if (cid) localStorage.setItem(CLIENT_KEY, cid);
        else localStorage.removeItem(CLIENT_KEY);
      } catch {}
    },
    [],
  );

  const logout = useCallback(() => {
    setRoleState(null);
    setClientId(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CLIENT_KEY);
    } catch {}
  }, []);

  return (
    <RoleContext.Provider value={{ role, clientId, hydrated, setRole, logout }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole(): RoleStore {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}
