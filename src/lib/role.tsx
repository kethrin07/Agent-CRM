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

// Read the persisted role synchronously. Returns nulls during SSR (no
// localStorage), but on the client it runs during the first render — so the
// role is correct on first paint instead of flashing a default, then correcting.
function readStored(): { role: Role | null; clientId: string | null } {
  if (typeof window === "undefined") return { role: null, clientId: null };
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return {
      role: saved === "admin" || saved === "client" ? saved : null,
      clientId: localStorage.getItem(CLIENT_KEY) || null,
    };
  } catch {
    return { role: null, clientId: null };
  }
}

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role | null>(() => readStored().role);
  const [clientId, setClientId] = useState<string | null>(
    () => readStored().clientId,
  );
  const [hydrated, setHydrated] = useState(false);

  // Mark hydrated after mount so SSR-dependent guards (RequireRole) settle.
  useEffect(() => setHydrated(true), []);

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
