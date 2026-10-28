"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Speaker = "agent" | "caller";
export type LiveLine = { t: string; who: Speaker; text: string };

export type LiveCall = {
  id: string;
  agent: "Nora" | "Bob";
  agentRole: string;
  caller: { name: string; phone: string };
  elapsed: number; // seconds, ticks up
  speaker: Speaker;
  lines: LiveLine[];
  cursor: number; // next index into the dialogue pool
};

function fmt(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Looping dialogue pools (append one line at a time to simulate a live stream).
const pools: Record<string, { who: Speaker; text: string }[]> = {
  "live-1": [
    { who: "agent", text: "Hi, thanks for calling MyHomeQuote, this is Nora. Are you looking for a home insurance quote today?" },
    { who: "caller", text: "Yeah, I just bought a place and need coverage before closing." },
    { who: "agent", text: "Congratulations! What's the ZIP code of the new home?" },
    { who: "caller", text: "73301." },
    { who: "agent", text: "Got it. Is it a single-family house?" },
    { who: "caller", text: "Yes, built in 2015, about 2,400 square feet." },
    { who: "agent", text: "Perfect. Roughly what's the purchase price?" },
    { who: "caller", text: "Three hundred and ninety thousand." },
    { who: "agent", text: "Thanks. What's the best email to send your quotes to?" },
    { who: "caller", text: "marcus.reed@email.com." },
  ],
  "live-2": [
    { who: "agent", text: "Thanks for calling MyHomeQuote, I'm Bob. Our office is closed, but I can get your quote started. What's your name?" },
    { who: "caller", text: "Priya Nair. My renewal is coming up and the rate jumped a lot." },
    { who: "agent", text: "Sorry to hear that. What's the ZIP code of your home?" },
    { who: "caller", text: "94536." },
    { who: "agent", text: "And is it a condo or a house?" },
    { who: "caller", text: "A townhome, and I own it." },
    { who: "agent", text: "Got it. How long have you been with your current insurer?" },
    { who: "caller", text: "About four years." },
    { who: "agent", text: "Thanks, Priya. A licensed agent will call you back with options. Are mornings okay?" },
    { who: "caller", text: "Mornings are great." },
  ],
};

// Deterministic initial snapshot (matches SSR + first client render).
const initialCalls: LiveCall[] = [
  {
    id: "live-1",
    agent: "Nora",
    agentRole: "Main line",
    caller: { name: "Marcus Reed", phone: "+1 512 555 0148" },
    elapsed: 42,
    speaker: "caller",
    cursor: 4,
    lines: [
      { t: "0:03", who: "agent", text: pools["live-1"][0].text },
      { t: "0:18", who: "caller", text: pools["live-1"][1].text },
      { t: "0:27", who: "agent", text: pools["live-1"][2].text },
      { t: "0:40", who: "caller", text: pools["live-1"][3].text },
    ],
  },
  {
    id: "live-2",
    agent: "Bob",
    agentRole: "Overflow & after-hours",
    caller: { name: "Priya Nair", phone: "+1 469 555 0132" },
    elapsed: 75,
    speaker: "agent",
    cursor: 3,
    lines: [
      { t: "0:04", who: "agent", text: pools["live-2"][0].text },
      { t: "0:34", who: "caller", text: pools["live-2"][1].text },
      { t: "1:08", who: "agent", text: pools["live-2"][2].text },
    ],
  },
];

const APPEND_EVERY = 4; // seconds between new transcript lines
const MAX_LINES = 40;

type Store = {
  calls: LiveCall[];
  openCallId: string | null;
  openCall: (id: string) => void;
  close: () => void;
};

const LiveCallsContext = createContext<Store | null>(null);

export function LiveCallsProvider({ children }: { children: React.ReactNode }) {
  const [calls, setCalls] = useState<LiveCall[]>(initialCalls);
  const [openCallId, setOpenCallId] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => {
      setCalls((prev) =>
        prev.map((c) => {
          const elapsed = c.elapsed + 1;
          // Append a new line on the cadence.
          if (elapsed % APPEND_EVERY === 0) {
            const pool = pools[c.id];
            const next = pool[c.cursor % pool.length];
            const lines = [
              ...c.lines,
              { t: fmt(elapsed), who: next.who, text: next.text },
            ].slice(-MAX_LINES);
            return {
              ...c,
              elapsed,
              lines,
              speaker: next.who,
              cursor: c.cursor + 1,
            };
          }
          return { ...c, elapsed };
        }),
      );
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const openCall = useCallback((id: string) => setOpenCallId(id), []);
  const close = useCallback(() => setOpenCallId(null), []);

  const value = useMemo<Store>(
    () => ({ calls, openCallId, openCall, close }),
    [calls, openCallId, openCall, close],
  );

  return (
    <LiveCallsContext.Provider value={value}>
      {children}
    </LiveCallsContext.Provider>
  );
}

export function useLiveCalls(): Store {
  const ctx = useContext(LiveCallsContext);
  if (!ctx)
    throw new Error("useLiveCalls must be used within LiveCallsProvider");
  return ctx;
}

export { fmt as fmtDuration };
