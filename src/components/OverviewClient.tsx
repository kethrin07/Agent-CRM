"use client";

import { useEffect, useState, type MouseEvent } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { QualityDonut } from "@/components/QualityDonut";
import { LiveNow } from "@/components/LiveNow";
import { Select } from "@/components/ui/Select";
import { Sparkline } from "@/components/ui/Sparkline";
import { TrendChip, sparkColor } from "@/components/ui/TrendChip";
import { StatusBadge } from "@/components/ui/Badge";
import { useLeadDrawer } from "@/components/LeadDrawer";
import { useLeads } from "@/lib/leads-store";
import { computeMetrics, emptyMetrics, rangeToWindow } from "@/lib/metrics";
import { rangeOptions, rangeSubtitle, type RangeKey } from "@/lib/data";

const toMs = (d: string, endOfDay = false) =>
  new Date(`${d}T${endOfDay ? "23:59:59.999" : "00:00:00"}`).getTime();
const fmtDate = (ms: number) =>
  new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
const isoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;

export function OverviewClient() {
  const [range, setRange] = useState<RangeKey | "custom">("7d");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const { open } = useLeadDrawer();
  const { leads } = useLeads();

  // Metrics depend on Date.now() (chart labels), so compute only after mount to
  // keep SSR and first client render identical (no hydration mismatch).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Newest leads first, so freshly imported leads surface here too.
  const recent = [...leads]
    .sort((a, b) => b.ts.localeCompare(a.ts))
    .slice(0, 5);

  const win =
    range === "custom"
      ? {
          start: from ? toMs(from) : Date.now() - 7 * 86_400_000,
          end: to ? toMs(to, true) : Date.now(),
        }
      : rangeToWindow(range);

  const { kpis, funnel, quality, chart, chartTitle } = mounted
    ? computeMetrics(leads, win)
    : emptyMetrics();

  const rangeLabel =
    range === "custom"
      ? `from ${fmtDate(win.start)} to ${fmtDate(win.end)}`
      : rangeSubtitle[range];

  // Selecting "Custom" prefills the last 7 days so the pickers aren't empty.
  const onRangeChange = (v: string) => {
    const r = v as RangeKey | "custom";
    if (r === "custom" && !from && !to) {
      const now = new Date();
      const wk = new Date(now);
      wk.setDate(now.getDate() - 7);
      setFrom(isoDate(wk));
      setTo(isoDate(now));
    }
    setRange(r);
  };

  const funnelTop = funnel[0].value;
  const winRate = funnelTop
    ? Math.round((funnel[funnel.length - 1].value / funnelTop) * 100)
    : 0;

  const openDrawer = (e: MouseEvent<HTMLElement>, id: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    open(id);
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[26px] font-semibold tracking-[-0.02em]">Dashboard</h1>
          <div className="text-sm text-muted">
            How Nora and Bob handled inbound calls {rangeLabel}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="hidden shell:inline-flex">
            <ThemeToggle compact />
          </span>
          {range === "custom" && (
            <div className="flex min-h-11 items-center gap-2 rounded-lg border border-border-strong bg-card px-3 text-sm text-ink">
              <input
                type="date"
                aria-label="From date"
                value={from}
                max={to || undefined}
                onChange={(e) => setFrom(e.target.value)}
                className="bg-transparent text-sm text-ink outline-none"
              />
              <span className="text-muted">–</span>
              <input
                type="date"
                aria-label="To date"
                value={to}
                min={from || undefined}
                onChange={(e) => setTo(e.target.value)}
                className="bg-transparent text-sm text-ink outline-none"
              />
            </div>
          )}
          <Select
            id="range"
            aria-label="Date range"
            wrapperClassName="w-[160px]"
            value={range}
            onChange={(e) => onRangeChange(e.target.value)}
          >
            {rangeOptions.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
            <option value="custom">Custom range</option>
          </Select>
        </div>
      </div>

      {/* Live calls happening now (real, polled from ElevenLabs) */}
      <LiveNow />

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

      {/* Conversion funnel */}
      <section className="card flex flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold">Conversion funnel</h2>
            <div className="text-[13px] text-muted">
              From inbound call to closed customer {rangeLabel}
            </div>
          </div>
          <div className="text-[13px] text-muted">
            Conversion rate{" "}
            <span className="font-semibold text-ink">{winRate}%</span> of calls
          </div>
        </div>

        <div className="flex flex-col gap-3.5">
          {funnel.map((f, i) => {
            const widthPct = (f.value / funnelTop) * 100;
            const conv =
              i === 0 || !funnel[i - 1].value
                ? null
                : Math.round((f.value / funnel[i - 1].value) * 100);
            return (
              <div key={f.label} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium">{f.label}</span>
                  <span className="flex items-baseline gap-3">
                    <span className="font-mono">{f.value.toLocaleString()}</span>
                    <span className="w-16 text-right font-mono text-xs text-muted">
                      {conv !== null ? `${conv}%` : ""}
                    </span>
                  </span>
                </div>
                <div className="h-2.5 rounded bg-track">
                  <div
                    className="h-2.5 rounded transition-all"
                    style={{ width: `${widthPct}%`, background: f.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Chart + quality */}
      <div className="grid items-start gap-4 [grid-template-columns:repeat(auto-fit,minmax(340px,1fr))]">
        {/* Calls per day */}
        <section className="card flex flex-col gap-[18px] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold">{chartTitle}</h2>
            <div className="flex gap-3.5 text-xs text-muted2">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-brand" />
                Real leads
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-brand-bar-soft" />
                Spam / unclear
              </span>
            </div>
          </div>
          <div className="flex h-[200px] items-end gap-3.5 border-b border-border">
            {chart.map((d) => (
              <div
                key={d.day}
                className="group relative flex h-full flex-grow basis-0 flex-col justify-end gap-0.5"
              >
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2.5 py-1.5 text-[11px] text-page shadow-md group-hover:block">
                  <div className="font-semibold">
                    {d.day} · {d.total} calls
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-sm bg-brand" />
                    {d.real} real
                    <span className="ml-1 h-2 w-2 rounded-sm bg-brand-bar-soft" />
                    {d.other} spam/unclear
                  </div>
                </div>
                <div className="text-center font-mono text-[11px] text-muted">
                  {d.total}
                </div>
                <div
                  className="rounded-t bg-brand-bar-soft transition-opacity group-hover:opacity-80"
                  style={{ height: d.otherH }}
                />
                <div
                  className="bg-brand transition-opacity group-hover:opacity-90"
                  style={{ height: d.realH }}
                />
              </div>
            ))}
          </div>
          <div className="-mt-2.5 flex gap-3.5">
            {chart.map((d, i) => (
              <div
                key={d.day}
                className={`flex-grow basis-0 text-center text-xs ${
                  i === chart.length - 1
                    ? "font-semibold text-ink"
                    : "text-muted"
                }`}
              >
                {d.day}
              </div>
            ))}
          </div>
        </section>

        {/* Lead quality */}
        <section className="card flex flex-col gap-4 p-5">
          <h2 className="text-base font-semibold">Lead quality</h2>
          <QualityDonut data={quality} />
        </section>
      </div>

      {/* Latest calls */}
      <section className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <h2 className="text-base font-semibold">Latest calls</h2>
          <Link href="/leads" className="text-sm font-medium">
            View all leads
          </Link>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            {recent.map((r) => (
              <Link
                key={r.id}
                href={`/leads/${r.id}`}
                onClick={(e) => openDrawer(e, r.id)}
                className="grid items-center gap-4 border-b border-row px-5 py-3.5 text-sm text-ink no-underline transition-colors last:border-b-0 hover:bg-hover hover:text-ink [grid-template-columns:minmax(180px,2fr)_110px_minmax(180px,2fr)_90px_70px_140px]"
              >
                <span className="flex flex-col gap-0.5">
                  <span className="font-semibold">{r.name}</span>
                  <span className="font-mono text-xs text-muted">{r.phone}</span>
                </span>
                <StatusBadge status={r.status} />
                <span className="text-sub">{r.intent}</span>
                <span className="text-sub">{r.agent}</span>
                <span className="font-mono text-sub">{r.dur}</span>
                <span className="text-muted">{r.when}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
