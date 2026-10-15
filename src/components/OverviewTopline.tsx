"use client";

import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sparkline } from "@/components/ui/Sparkline";
import { TrendChip, sparkColor } from "@/components/ui/TrendChip";
import {
  kpisByRange,
  rangeOptions,
  rangeSubtitle,
  type RangeKey,
} from "@/lib/data";

export function OverviewTopline() {
  const [range, setRange] = useState<RangeKey>("7d");
  const kpis = kpisByRange[range];

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[26px] font-semibold tracking-[-0.02em]">Overview</h1>
          <div className="text-sm text-muted">
            How Nora and Bob handled inbound calls {rangeSubtitle[range]}
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
          <Link
            href="/agent"
            className="flex min-h-10 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white no-underline transition-colors hover:bg-brand-hover hover:text-white"
          >
            Edit agents
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(210px,1fr))]">
        {kpis.map((k) => (
          <div
            key={k.id}
            className="card flex flex-col gap-3 overflow-hidden px-5 py-[18px]"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="text-[13px] text-muted">{k.label}</div>
              <TrendChip trend={k.trend} />
            </div>
            <div className="flex items-end justify-between gap-3">
              <div className="text-[30px] font-semibold leading-none tracking-[-0.02em]">
                {k.value}
              </div>
              <Sparkline
                id={`${range}-${k.id}`}
                points={k.spark}
                color={sparkColor[k.trend.tone]}
                className="h-8 w-[88px] flex-shrink-0"
              />
            </div>
            <div className="text-xs text-muted2">{k.sub}</div>
          </div>
        ))}
      </div>
    </>
  );
}
