"use client";

import { createContext, useContext, useEffect, useState } from "react";

/**
 * Real "live now" status: polls /api/live-calls (which asks ElevenLabs for
 * in-progress conversations) every few seconds. This only tells you a call is
 * happening — it does not stream audio or transcript.
 */

export type LiveCall = {
  id: string;
  agent: string; // "Nora" | "Bob"
  caller: string; // phone number or "Web caller"
  startedAt: number; // unix ms, for the elapsed timer
};

type Store = { calls: LiveCall[] };

const LiveContext = createContext<Store>({ calls: [] });

export function LiveCallsProvider({ children }: { children: React.ReactNode }) {
  const [calls, setCalls] = useState<LiveCall[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      fetch("/api/live-calls")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (!cancelled && Array.isArray(d?.calls)) setCalls(d.calls);
        })
        .catch(() => {});
    };
    load();
    const id = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 6000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return <LiveContext.Provider value={{ calls }}>{children}</LiveContext.Provider>;
}

export function useLiveCalls(): Store {
  return useContext(LiveContext);
}

export function fmtElapsed(startedAt: number): string {
  const secs = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
  const m = Math.floor(secs / 60);
  return `${m}:${String(secs % 60).padStart(2, "0")}`;
}
