"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { type Lead, type Stage } from "./data";
import { useRole } from "./role";
import { getDemoLeads } from "./demo-data";

// Demo mode: run on the built-in mock dataset instead of Supabase, so the same
// codebase powers both the sales-demo site and the real site via one env flag.
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

type Lifecycle = { stage: Stage; assigneeId: string | null };
type LifecycleMap = Record<string, Lifecycle>;

const STORAGE_KEY = "mhq-pipeline-v1";
const NOTES_KEY = "mhq-notes-v1";
// Old CSV-import store; now migrated into Supabase on first load, then removed.
const LEGACY_IMPORTED_KEY = "mhq-imported-leads-v1";

type Store = {
  leads: Lead[];
  setStage: (id: string, stage: Stage) => void;
  setAssignee: (id: string, assigneeId: string | null) => void;
  notes: Record<string, string>;
  setNote: (id: string, text: string) => void;
  refresh: () => void;
};

const LeadsContext = createContext<Store | null>(null);

export function LeadsStoreProvider({ children }: { children: React.ReactNode }) {
  // A client only sees their own tenant's leads; admins see everything.
  const { role, clientId } = useRole();
  // Pipeline (stage/assignee) + notes stay as a local overlay keyed by lead id.
  const [overrides, setOverrides] = useState<LifecycleMap>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  // Base leads come from Supabase. Empty until the fetch resolves after mount
  // (deterministic empty for SSR, so no hydration mismatch).
  const [base, setBase] = useState<Lead[]>([]);
  // Gate localStorage writes until after we've loaded, so the initial empty
  // state can't clobber saved pipeline/notes data.
  const [hydrated, setHydrated] = useState(false);

  // Fetch leads from Supabase (used by the poll and by refresh()). In demo mode
  // the data comes from the static fixture, so there's nothing to fetch.
  const load = useCallback(() => {
    if (DEMO_MODE) {
      setBase(getDemoLeads());
      return;
    }
    fetch("/api/leads")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data?.leads)) setBase(data.leads);
      })
      .catch(() => {});
  }, []);

  // Load saved pipeline/notes from localStorage.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setOverrides((prev) => ({ ...prev, ...JSON.parse(raw) }));
      const rawNotes = localStorage.getItem(NOTES_KEY);
      if (rawNotes) setNotes(JSON.parse(rawNotes));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
    } catch {}
  }, [overrides, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    } catch {}
  }, [notes, hydrated]);

  // One-time migration: push any CSV imports still in localStorage into Supabase,
  // then drop the local copy (imports now write straight to Supabase).
  useEffect(() => {
    if (DEMO_MODE) return;
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(LEGACY_IMPORTED_KEY);
    } catch {}
    if (!raw) return;
    let list: Lead[] = [];
    try {
      list = JSON.parse(raw);
    } catch {}
    if (!Array.isArray(list) || list.length === 0) {
      try {
        localStorage.removeItem(LEGACY_IMPORTED_KEY);
      } catch {}
      return;
    }
    fetch("/api/leads/import", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ leads: list }),
    })
      .then((r) => {
        if (r.ok) {
          try {
            localStorage.removeItem(LEGACY_IMPORTED_KEY);
          } catch {}
          load();
        }
      })
      .catch(() => {});
  }, [load]);

  // Load once, then poll Supabase so new calls/imports appear without a reload
  // (pause when hidden). Demo mode is a static fixture — load once, no polling.
  useEffect(() => {
    load();
    if (DEMO_MODE) return;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 15000);
    return () => clearInterval(id);
  }, [load]);

  const setStage = useCallback((id: string, stage: Stage) => {
    setOverrides((p) => ({ ...p, [id]: { ...p[id], stage } }));
  }, []);

  const setAssignee = useCallback((id: string, assigneeId: string | null) => {
    setOverrides((p) => ({ ...p, [id]: { ...p[id], assigneeId } }));
  }, []);

  const setNote = useCallback((id: string, text: string) => {
    setNotes((p) => ({ ...p, [id]: text }));
  }, []);

  const leads = useMemo(() => {
    const merged = base.map((l) => ({ ...l, ...overrides[l.id] }));
    // Client role → scope to their tenant's leads only.
    return role === "client" && clientId
      ? merged.filter((l) => l.clientId === clientId)
      : merged;
  }, [base, overrides, role, clientId]);

  const value = useMemo<Store>(
    () => ({ leads, setStage, setAssignee, notes, setNote, refresh: load }),
    [leads, setStage, setAssignee, notes, setNote, load],
  );

  return <LeadsContext.Provider value={value}>{children}</LeadsContext.Provider>;
}

export function useLeads(): Store {
  const ctx = useContext(LeadsContext);
  if (!ctx) throw new Error("useLeads must be used within LeadsStoreProvider");
  return ctx;
}

export function useLead(id: string): Lead | undefined {
  const { leads } = useLeads();
  return leads.find((l) => l.id === id);
}
