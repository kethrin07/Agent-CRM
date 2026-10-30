import type {
  AgentMetrics,
  CallBar,
  FunnelStep,
  Kpi,
  Lead,
  QualitySlice,
  RangeKey,
  Trend,
} from "./data";

/**
 * Computes the dashboard metrics (KPIs, funnel, quality, call-volume chart)
 * from the real lead set for a given range. Replaces the old hardcoded
 * `*ByRange` constants — numbers now reflect actual data.
 */

const DAY = 86_400_000;
const WINDOW_MS: Record<RangeKey, number> = {
  "24h": DAY,
  "7d": 7 * DAY,
  "30d": 30 * DAY,
};
export type Window = { start: number; end: number };

/** A rolling preset window ending now. */
export function rangeToWindow(range: RangeKey): Window {
  const end = Date.now();
  return { start: end - WINDOW_MS[range], end };
}

const at = (l: Lead) => new Date(l.ts).getTime();

function durSecs(l: Lead): number {
  if (typeof l.durationSecs === "number") return l.durationSecs;
  const [m, s] = (l.dur || "0:0").split(":").map(Number);
  return (m || 0) * 60 + (s || 0);
}

function fmtAvg(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.round(secs % 60);
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

const within = (leads: Lead[], start: number, end: number) =>
  leads.filter((l) => {
    const t = at(l);
    return t >= start && t < end;
  });

// Percentage change vs the previous period. `invert` = a drop is good (spam).
function trend(curr: number, prev: number, invert = false): Trend {
  if (prev === 0) {
    return { dir: "up", label: curr > 0 ? "New" : "—", tone: "neutral" };
  }
  const pct = Math.round(((curr - prev) / prev) * 100);
  const good = invert ? pct < 0 : pct > 0;
  return {
    dir: pct >= 0 ? "up" : "down",
    label: `${pct >= 0 ? "+" : ""}${pct}%`,
    tone: pct === 0 ? "neutral" : good ? "pos" : "neg",
  };
}

// Count per sub-bucket across the window — drives the little sparklines.
function spark(leads: Lead[], start: number, windowMs: number, n = 7): number[] {
  const step = windowMs / n;
  return Array.from({ length: n }, (_, i) =>
    within(leads, start + i * step, start + (i + 1) * step).length,
  );
}

type Spec = { label: string; start: number; end: number };

// Splits [start, end] into chart buckets with clear labels. Granularity scales
// with the span: hour-ranges for ≤2 days, calendar days for ≤10 days, else
// multi-day ranges sized so there are ~7 bars.
function bucketLayout(start: number, end: number): { specs: Spec[]; title: string } {
  const span = Math.max(1, end - start);
  const hr = (t: number) => {
    const h = new Date(t).getHours();
    return { h12: ((h + 11) % 12) + 1, mer: h < 12 ? "am" : "pm" };
  };
  const dayFmt = (t: number) =>
    new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const isToday = (t: number) => {
    const d = new Date(t);
    const n = new Date();
    return (
      d.getFullYear() === n.getFullYear() &&
      d.getMonth() === n.getMonth() &&
      d.getDate() === n.getDate()
    );
  };

  if (span <= 2 * DAY) {
    const size = 4 * 3_600_000;
    const specs: Spec[] = [];
    for (let e = end; e > start + 1000 && specs.length < 24; ) {
      const s = Math.max(start, e - size);
      const a = hr(s);
      const b = hr(e);
      specs.unshift({
        label:
          a.mer === b.mer
            ? `${a.h12}–${b.h12}${b.mer}`
            : `${a.h12}${a.mer}–${b.h12}${b.mer}`,
        start: s,
        end: e,
      });
      e = s;
    }
    return { specs, title: "Calls by hour" };
  }

  if (span <= 10 * DAY) {
    const specs: Spec[] = [];
    const d0 = new Date(start);
    d0.setHours(0, 0, 0, 0);
    for (let t = d0.getTime(); t < end; t += DAY) {
      specs.push({ label: isToday(t) ? "Today" : dayFmt(t), start: t, end: t + DAY });
    }
    return { specs, title: "Calls per day" };
  }

  const size = Math.ceil(span / DAY / 7) * DAY;
  const specs: Spec[] = [];
  for (let e = end; e > start + 1000 && specs.length < 24; ) {
    const s = Math.max(start, e - size);
    const sd = new Date(s);
    const ed = new Date(e - 1);
    const endLabel =
      ed.getMonth() === sd.getMonth() ? `${ed.getDate()}` : dayFmt(e - 1);
    specs.unshift({ label: `${dayFmt(s)} – ${endLabel}`, start: s, end: e });
    e = s;
  }
  return { specs, title: "Calls per period" };
}

function buildChart(leads: Lead[], specs: Spec[]): CallBar[] {
  const bars = specs.map((sp) => {
    const inB = within(leads, sp.start, sp.end);
    const real = inB.filter((l) => l.status === "Real").length;
    const other = inB.length - real;
    return { day: sp.label, real, other, total: real + other, realH: 0, otherH: 0 };
  });
  const max = Math.max(1, ...bars.map((b) => b.total));
  const f = 150 / max;
  return bars.map((b) => ({
    ...b,
    realH: Math.round(b.real * f),
    otherH: Math.round(b.other * f),
  }));
}

const FUNNEL_LABELS = ["Inbound calls", "Real leads", "Contacted", "Quoted", "Converted"];
const FUNNEL_COLORS = ["#C2D1EF", "#98B4EA", "#6588DE", "#3E65D2", "#2149BE"];

export type DashboardMetrics = {
  kpis: Kpi[];
  funnel: FunnelStep[];
  quality: QualitySlice[];
  chart: CallBar[];
  chartTitle: string;
};

// Deterministic zeroed metrics (no Date.now) for the pre-mount/SSR render, so
// server and client first paint match before the real data is computed.
export function emptyMetrics(): DashboardMetrics {
  const kpi = (id: string, label: string, value: string, sub: string): Kpi => ({
    id,
    label,
    value,
    sub,
    trend: { dir: "up", label: "—", tone: "neutral" },
    spark: [0, 0, 0, 0, 0, 0, 0],
  });
  return {
    kpis: [
      kpi("inbound", "Inbound calls", "0", "vs previous period"),
      kpi("real", "Real leads", "0", "0% of all calls"),
      kpi("spam", "Spam or junk", "0", "Filtered before your team"),
      kpi("avg", "Avg call length", "0m 00s", "Real leads only: 0m 00s"),
    ],
    funnel: FUNNEL_LABELS.map((label, i) => ({
      label,
      value: 0,
      color: FUNNEL_COLORS[i],
    })),
    quality: [
      { label: "Real lead", count: 0, pct: 0, color: "var(--color-good)" },
      { label: "Unclear", count: 0, pct: 0, color: "var(--color-warn-bar)" },
      { label: "Spam", count: 0, pct: 0, color: "var(--color-bad-bar)" },
    ],
    chart: [],
    chartTitle: "Calls per day",
  };
}

export function computeMetrics(
  allLeads: Lead[],
  window: Window,
): DashboardMetrics {
  const { start, end } = window;
  const span = Math.max(1, end - start);
  const cur = within(allLeads, start, end);
  const prev = within(allLeads, start - span, start);

  const byStatus = (ls: Lead[], s: string) => ls.filter((l) => l.status === s).length;
  const byStage = (ls: Lead[], stages: string[]) =>
    ls.filter((l) => stages.includes(l.stage)).length;

  const inbound = cur.length;
  const real = byStatus(cur, "Real");
  const unclear = byStatus(cur, "Unclear");
  const spam = byStatus(cur, "Spam");
  const avgSec = cur.length
    ? cur.reduce((a, l) => a + durSecs(l), 0) / cur.length
    : 0;
  const realLeads = cur.filter((l) => l.status === "Real");
  const realAvgSec = realLeads.length
    ? realLeads.reduce((a, l) => a + durSecs(l), 0) / realLeads.length
    : 0;
  const realPct = inbound ? Math.round((real / inbound) * 100) : 0;

  const prevAvg = prev.length
    ? prev.reduce((a, l) => a + durSecs(l), 0) / prev.length
    : 0;
  const avgDiff = Math.round(avgSec - prevAvg);

  const kpis: Kpi[] = [
    {
      id: "inbound",
      label: "Inbound calls",
      value: inbound.toLocaleString(),
      trend: trend(inbound, prev.length),
      sub: "vs the previous period",
      spark: spark(cur, start, span),
    },
    {
      id: "real",
      label: "Real leads",
      value: real.toLocaleString(),
      trend: trend(real, byStatus(prev, "Real")),
      sub: `${realPct}% of all calls`,
      spark: spark(realLeads, start, span),
    },
    {
      id: "spam",
      label: "Spam or junk",
      value: spam.toLocaleString(),
      trend: trend(spam, byStatus(prev, "Spam"), true),
      sub: "Filtered before your team",
      spark: spark(cur.filter((l) => l.status === "Spam"), start, span),
    },
    {
      id: "avg",
      label: "Avg call length",
      value: fmtAvg(avgSec),
      trend: {
        dir: avgDiff >= 0 ? "up" : "down",
        label: prev.length ? `${avgDiff >= 0 ? "+" : ""}${avgDiff}s` : "New",
        tone: "neutral",
      },
      sub: `Real leads only: ${fmtAvg(realAvgSec)}`,
      spark: spark(cur, start, span),
    },
  ];

  const funnel: FunnelStep[] = [
    inbound,
    real,
    byStage(cur, ["Contacted", "Quoted", "Won"]),
    byStage(cur, ["Quoted", "Won"]),
    byStage(cur, ["Won"]),
  ].map((value, i) => ({
    label: FUNNEL_LABELS[i],
    value,
    color: FUNNEL_COLORS[i],
  }));

  const q = (label: string, count: number, color: string): QualitySlice => ({
    label,
    count,
    pct: inbound ? Math.round((count / inbound) * 100) : 0,
    color,
  });
  const quality: QualitySlice[] = [
    q("Real lead", real, "var(--color-good)"),
    q("Unclear", unclear, "var(--color-warn-bar)"),
    q("Spam", spam, "var(--color-bad-bar)"),
  ];

  const { specs, title } = bucketLayout(start, end);
  return { kpis, funnel, quality, chart: buildChart(cur, specs), chartTitle: title };
}

// Real per-agent metrics from the live lead set, for agents flagged `live` on
// the agents page. `clientId` "all" = across all of the agent's clients.
export function agentMetricsFromLeads(
  leads: Lead[],
  agentName: string,
  clientId: string,
  range: RangeKey,
): AgentMetrics {
  const { start, end } = rangeToWindow(range);
  const ls = leads.filter((l) => {
    if (l.agent !== agentName) return false;
    if (clientId !== "all" && l.clientId !== clientId) return false;
    const t = at(l);
    return t >= start && t < end;
  });
  const calls = ls.length;
  const avgSec = calls ? ls.reduce((a, l) => a + durSecs(l), 0) / calls : 0;
  const m = Math.floor(avgSec / 60);
  const s = Math.round(avgSec % 60);
  return {
    calls,
    real: ls.filter((l) => l.status === "Real").length,
    spam: ls.filter((l) => l.status === "Spam").length,
    converted: ls.filter((l) => l.stage === "Won").length,
    avgLen: `${m}:${String(s).padStart(2, "0")}`,
  };
}
