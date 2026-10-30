"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { leads as baseLeads, type Lead, type Stage } from "./data";

type Lifecycle = { stage: Stage; assigneeId: string | null };
type LifecycleMap = Record<string, Lifecycle>;

const STORAGE_KEY = "mhq-pipeline-v1";
const NOTES_KEY = "mhq-notes-v1";
const IMPORTED_KEY = "mhq-imported-leads-v1";

const seed: LifecycleMap = Object.fromEntries(
  baseLeads.map((l) => [l.id, { stage: l.stage, assigneeId: l.assigneeId }]),
);

type Store = {
  leads: Lead[];
  setStage: (id: string, stage: Stage) => void;
  setAssignee: (id: string, assigneeId: string | null) => void;
  notes: Record<string, string>;
  setNote: (id: string, text: string) => void;
  addLeads: (newLeads: Lead[]) => void;
};

const LeadsContext = createContext<Store | null>(null);

export function LeadsStoreProvider({ children }: { children: React.ReactNode }) {
  // Deterministic seed on first render (server + client match), then rehydrate
  // any saved changes from localStorage after mount.
  const [overrides, setOverrides] = useState<LifecycleMap>(seed);
  const [notes, setNotes] = useState<Record<string, string>>({});
  // Leads uploaded via CSV import. Empty on first render (server + client
  // match); rehydrated from localStorage after mount, like overrides/notes.
  const [imported, setImported] = useState<Lead[]>([]);
  // Base leads: start as the mock set (deterministic for SSR), then replaced
  // with Supabase leads after mount when the backend is configured.
  const [base, setBase] = useState<Lead[]>(baseLeads);
  // Gate writes until after we've loaded from localStorage, otherwise the
  // initial empty state would clobber saved data (esp. under dev StrictMode).
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setOverrides((prev) => ({ ...prev, ...JSON.parse(raw) }));
      const rawNotes = localStorage.getItem(NOTES_KEY);
      if (rawNotes) setNotes(JSON.parse(rawNotes));
      const rawImported = localStorage.getItem(IMPORTED_KEY);
      if (rawImported) setImported(JSON.parse(rawImported));
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

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(IMPORTED_KEY, JSON.stringify(imported));
    } catch {}
  }, [imported, hydrated]);

  // Pull leads from Supabase when the backend is configured. A 200 (even with
  // an empty list) means Supabase is the source of truth and replaces the mock
  // base; anything else (501 not configured, network error) keeps the mock.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/leads")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && Array.isArray(data?.leads)) setBase(data.leads);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const setStage = useCallback((id: string, stage: Stage) => {
    setOverrides((p) => ({ ...p, [id]: { ...p[id], stage } }));
  }, []);

  const setAssignee = useCallback((id: string, assigneeId: string | null) => {
    setOverrides((p) => ({ ...p, [id]: { ...p[id], assigneeId } }));
  }, []);

  const setNote = useCallback((id: string, text: string) => {
    setNotes((p) => ({ ...p, [id]: text }));
  }, []);

  const addLeads = useCallback((newLeads: Lead[]) => {
    setImported((p) => [...newLeads, ...p]);
  }, []);

  const leads = useMemo(
    () => [...base, ...imported].map((l) => ({ ...l, ...overrides[l.id] })),
    [base, imported, overrides],
  );

  const value = useMemo<Store>(
    () => ({ leads, setStage, setAssignee, notes, setNote, addLeads }),
    [leads, setStage, setAssignee, notes, setNote, addLeads],
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
