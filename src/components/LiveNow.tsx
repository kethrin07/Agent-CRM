"use client";

import { useEffect, useState } from "react";
import { useLiveCalls, fmtElapsed } from "@/lib/live-status";
import { agentAccent } from "@/lib/data";

const neutral = { bg: "var(--color-neutral-bg)", fg: "var(--color-neutral-fg)" };

/** Dashboard section showing calls the AI agents are on right now. */
export function LiveNow() {
  const { calls } = useLiveCalls();
  const [, setTick] = useState(0);

  // Tick every second so the elapsed timers advance between polls.
  useEffect(() => {
    if (calls.length === 0) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [calls.length]);

  if (calls.length === 0) return null;

  return (
    <section className="card flex flex-col gap-3 p-5">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 flex-shrink-0 animate-pulse rounded-full bg-good" />
        <h2 className="text-base font-semibold">Live now</h2>
        <span className="text-[13px] text-muted">
          {calls.length} call{calls.length === 1 ? "" : "s"} in progress
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {calls.map((c) => {
          const accent = agentAccent[c.agent] ?? neutral;
          return (
            <div
              key={c.id}
              className="flex items-center gap-3 rounded-xl border border-border p-3"
            >
              <span className="relative flex-shrink-0">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full font-semibold"
                  style={{ background: accent.bg, color: accent.fg }}
                >
                  {c.agent[0]}
                </span>
                <span className="absolute -right-0.5 -top-0.5 h-3 w-3 animate-pulse rounded-full border-2 border-card bg-good" />
              </span>

              <div className="flex min-w-0 flex-col">
                <span className="text-sm font-semibold">{c.agent}</span>
                <span className="truncate text-xs text-muted">{c.caller}</span>
              </div>

              <span className="ml-auto font-mono text-sm tabular-nums text-sub">
                {fmtElapsed(c.startedAt)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
