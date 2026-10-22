"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useRole } from "@/lib/role";
import {
  agentAccent,
  agentPerfByRange,
  rangeOptions,
  rangeSubtitle,
  type RangeKey,
} from "@/lib/data";

function Metric({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-sub">{label}</span>
        <span className="font-mono text-muted">{value}%</span>
      </div>
      <div className="h-2 rounded bg-track">
        <div
          className="h-2 rounded transition-all"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function AgentsPage() {
  const { role, hydrated } = useRole();
  const router = useRouter();
  const [range, setRange] = useState<RangeKey>("7d");

  useEffect(() => {
    if (hydrated && role !== "admin") router.replace("/");
  }, [hydrated, role, router]);

  if (role !== "admin") return null;

  const perf = agentPerfByRange[range];
  const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[26px] font-semibold tracking-[-0.02em]">
            Agent performance
          </h1>
          <div className="text-sm text-muted">
            How Nora and Bob compare {rangeSubtitle[range]}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden shell:inline-flex">
            <ThemeToggle compact />
          </span>
          <label className="sr-only" htmlFor="range">
            Date range
          </label>
          <select
            id="range"
            value={range}
            onChange={(e) => setRange(e.target.value as RangeKey)}
            className="min-h-10 rounded-lg border border-border-strong bg-card px-3 text-sm text-ink"
          >
            {rangeOptions.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Agent cards */}
      <div className="grid gap-5 lg:grid-cols-2">
        {perf.map((a) => {
          const accent = agentAccent[a.name];
          const tiles = [
            { label: "Calls handled", value: a.calls },
            { label: "Real leads", value: a.real },
            { label: "Converted", value: a.converted },
          ];
          return (
            <section
              key={a.name}
              className="card flex flex-col gap-5 p-5 sm:p-6"
            >
              {/* Identity */}
              <div className="flex items-center gap-3">
                <span
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-lg font-semibold"
                  style={{ background: accent.bg, color: accent.fg }}
                >
                  {a.initial}
                </span>
                <div className="flex flex-col">
                  <span className="text-lg font-semibold">{a.name}</span>
                  <span className="text-[13px] text-muted">{a.role}</span>
                </div>
              </div>

              {/* Headline numbers */}
              <div className="grid grid-cols-3 gap-3">
                {tiles.map((t) => (
                  <div
                    key={t.label}
                    className="flex flex-col gap-1 rounded-xl bg-hover p-3"
                  >
                    <span className="text-[22px] font-semibold leading-none tracking-[-0.02em]">
                      {t.value.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted">{t.label}</span>
                  </div>
                ))}
              </div>

              {/* Rates */}
              <div className="flex flex-col gap-3.5">
                <Metric
                  label="Real-lead rate"
                  value={pct(a.real, a.calls)}
                  color="var(--color-good)"
                />
                <Metric
                  label="Spam filtered"
                  value={pct(a.spam, a.calls)}
                  color="var(--color-bad-bar)"
                />
                <Metric
                  label="Conversion rate"
                  value={pct(a.converted, a.real)}
                  color="var(--color-brand)"
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-hairline pt-3.5 text-sm">
                <span className="text-muted">Avg call length</span>
                <span className="font-mono font-medium">{a.avgLen}</span>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
