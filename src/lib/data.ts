// Mock data ported from the MyHomeQuote CRM prototype.
// A voice-AI CRM: agents Nora & Bob answer inbound home-insurance calls
// (ElevenLabs + Twilio), leads land in Supabase.

export type Status = "Real" | "Unclear" | "Spam";

// Colors reference CSS tokens (var(--…)) so they flip in dark mode.
export const statusStyle: Record<
  Status,
  { bg: string; fg: string; bar: string }
> = {
  Real: {
    bg: "var(--color-good-bg)",
    fg: "var(--color-good-fg)",
    bar: "var(--color-good)",
  },
  Unclear: {
    bg: "var(--color-warn-bg)",
    fg: "var(--color-warn-fg)",
    bar: "var(--color-warn-bar)",
  },
  Spam: {
    bg: "var(--color-bad-bg)",
    fg: "var(--color-bad-fg)",
    bar: "var(--color-bad-bar)",
  },
};

export const agentAccent: Record<string, { bg: string; fg: string }> = {
  Nora: { bg: "var(--color-nora-bg)", fg: "var(--color-nora-fg)" },
  Bob: { bg: "var(--color-bob-bg)", fg: "var(--color-bob-fg)" },
  Imported: { bg: "var(--color-neutral-bg)", fg: "var(--color-neutral-fg)" },
};

/* ── Lead lifecycle (the human follow-up pipeline, after AI qualification) ── */

export type Stage = "New" | "Contacted" | "Quoted" | "Won" | "Lost";

export const stageOrder: Stage[] = [
  "New",
  "Contacted",
  "Quoted",
  "Won",
  "Lost",
];

export const stageMeta: Record<
  Stage,
  { label: string; bg: string; fg: string; dot: string }
> = {
  New: {
    label: "New",
    bg: "var(--color-neutral-bg)",
    fg: "var(--color-neutral-fg)",
    dot: "var(--color-neutral-dot)",
  },
  Contacted: {
    label: "Contacted",
    bg: "var(--color-nora-bg)",
    fg: "var(--color-nora-fg)",
    dot: "var(--color-nora-fg)",
  },
  Quoted: {
    label: "Quoted",
    bg: "var(--color-teal-bg)",
    fg: "var(--color-teal-fg)",
    dot: "var(--color-teal-dot)",
  },
  Won: {
    label: "Won",
    bg: "var(--color-good-bg)",
    fg: "var(--color-good-fg)",
    dot: "var(--color-good)",
  },
  Lost: {
    label: "Lost",
    bg: "var(--color-bad-bg)",
    fg: "var(--color-bad-fg)",
    dot: "var(--color-bad-bar)",
  },
};

export type TeamMember = {
  id: string;
  name: string;
  initial: string;
  bg: string;
  fg: string;
};

export const team: TeamMember[] = [
  { id: "maya", name: "Maya Chen", initial: "MC", bg: "var(--color-nora-bg)", fg: "var(--color-nora-fg)" },
  { id: "devin", name: "Devin Ross", initial: "DR", bg: "var(--color-good-bg)", fg: "var(--color-good-fg)" },
  { id: "priya", name: "Priya Shah", initial: "PS", bg: "var(--color-teal-bg)", fg: "var(--color-teal-fg)" },
];

export const teamById = (id: string | null): TeamMember | null =>
  id ? (team.find((m) => m.id === id) ?? null) : null;

export const connections = [
  "ElevenLabs · connected",
  "Supabase · connected",
  "Twilio · 2 inbound numbers",
];

/* ── Overview ── */

export type Trend = {
  dir: "up" | "down";
  label: string;
  tone: "pos" | "neg" | "neutral";
};

export type Kpi = {
  id: string;
  label: string;
  value: string;
  trend: Trend;
  sub: string;
  spark: number[];
};

export type RangeKey = "24h" | "7d" | "30d";

export const rangeOptions: { key: RangeKey; label: string }[] = [
  { key: "24h", label: "Last 24 hours" },
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
];

export const rangeSubtitle: Record<RangeKey, string> = {
  "24h": "over the last 24 hours",
  "7d": "over the last 7 days",
  "30d": "over the last 30 days",
};

// Dashboard metric shapes. Values are computed from real leads in
// src/lib/metrics.ts — there are no hardcoded numbers here anymore.
export type FunnelStep = { label: string; value: number; color: string };

export type CallBar = {
  day: string;
  real: number;
  other: number;
  total: number;
  realH: number;
  otherH: number;
};

export type QualitySlice = {
  label: string;
  count: number;
  pct: number;
  color: string;
};

/* ── Agents (multi-tenant: general/shared + client-dedicated), per range ── */

export type Client = { id: string; name: string };

export const clients: Client[] = [
  { id: "acme", name: "Acme Insurance" },
  { id: "bluebird", name: "Bluebird Agency" },
];

export const clientName = (id: string): string =>
  clients.find((c) => c.id === id)?.name ?? id;

export type AgentMetrics = {
  calls: number;
  real: number;
  spam: number;
  converted: number;
  avgLen: string; // human mm:ss
};

export type AgentMeta = {
  id: string;
  name: string;
  initial: string;
  role: string;
  scope: "general" | "client";
  clientId: string | null; // null when general
  servedClientIds: string[]; // general → all clients; client → [clientId]
  status: "active" | "paused";
  number?: string;
  live?: boolean; // true → metrics computed from real leads, not mock
};

export const agents: AgentMeta[] = [
  { id: "nora", name: "Nora", initial: "N", role: "Main line", scope: "general", clientId: null, servedClientIds: ["acme", "bluebird"], status: "active", number: "+1 (888) 555-0140", live: true },
  { id: "bob", name: "Bob", initial: "B", role: "Overflow & after-hours", scope: "general", clientId: null, servedClientIds: ["acme", "bluebird"], status: "active", number: "+1 (888) 555-0177" },
  { id: "ava", name: "Ava", initial: "A", role: "Acme main line", scope: "client", clientId: "acme", servedClientIds: ["acme"], status: "active", number: "+1 (888) 555-0201" },
  { id: "max", name: "Max", initial: "M", role: "Bluebird quotes line", scope: "client", clientId: "bluebird", servedClientIds: ["bluebird"], status: "paused", number: "+1 (888) 555-0233" },
  { id: "zoe", name: "Zoe", initial: "Z", role: "Bluebird after-hours", scope: "client", clientId: "bluebird", servedClientIds: ["bluebird"], status: "active", number: "+1 (888) 555-0234" },
];

// agentId → clientId → RangeKey → AgentMetrics (per-client base numbers).
// "All clients" for a general agent is computed via combineMetrics().
export const agentClientMetrics: Record<
  string,
  Record<string, Record<RangeKey, AgentMetrics>>
> = {
  nora: {
    acme: {
      "24h": { calls: 55, real: 26, spam: 12, converted: 7, avgLen: "3:05" },
      "7d": { calls: 340, real: 150, spam: 82, converted: 42, avgLen: "3:08" },
      "30d": { calls: 1400, real: 620, spam: 340, converted: 170, avgLen: "3:10" },
    },
    bluebird: {
      "24h": { calls: 44, real: 18, spam: 12, converted: 4, avgLen: "2:56" },
      "7d": { calls: 272, real: 118, spam: 68, converted: 30, avgLen: "3:01" },
      "30d": { calls: 1130, real: 488, spam: 280, converted: 128, avgLen: "3:05" },
    },
  },
  bob: {
    acme: {
      "24h": { calls: 38, real: 14, spam: 12, converted: 3, avgLen: "2:15" },
      "7d": { calls: 240, real: 84, spam: 76, converted: 18, avgLen: "2:20" },
      "30d": { calls: 980, real: 340, spam: 310, converted: 72, avgLen: "2:22" },
    },
    bluebird: {
      "24h": { calls: 31, real: 11, spam: 11, converted: 2, avgLen: "2:08" },
      "7d": { calls: 190, real: 66, spam: 61, converted: 13, avgLen: "2:15" },
      "30d": { calls: 800, real: 276, spam: 260, converted: 55, avgLen: "2:17" },
    },
  },
  ava: {
    acme: {
      "24h": { calls: 28, real: 16, spam: 5, converted: 5, avgLen: "3:20" },
      "7d": { calls: 180, real: 103, spam: 34, converted: 31, avgLen: "3:22" },
      "30d": { calls: 760, real: 430, spam: 150, converted: 128, avgLen: "3:25" },
    },
  },
  max: {
    bluebird: {
      "24h": { calls: 22, real: 9, spam: 7, converted: 2, avgLen: "2:40" },
      "7d": { calls: 150, real: 60, spam: 48, converted: 14, avgLen: "2:44" },
      "30d": { calls: 610, real: 250, spam: 205, converted: 60, avgLen: "2:46" },
    },
  },
  zoe: {
    bluebird: {
      "24h": { calls: 18, real: 8, spam: 5, converted: 2, avgLen: "2:58" },
      "7d": { calls: 120, real: 58, spam: 33, converted: 16, avgLen: "3:00" },
      "30d": { calls: 520, real: 250, spam: 150, converted: 70, avgLen: "3:02" },
    },
  },
};

function parseLen(mmss: string): number {
  const [m, s] = mmss.split(":").map(Number);
  return (m || 0) * 60 + (s || 0);
}

function formatLen(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.round(secs % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Sum counts across clients; average avgLen weighted by call volume. */
export function combineMetrics(list: AgentMetrics[]): AgentMetrics {
  const calls = list.reduce((a, m) => a + m.calls, 0);
  const real = list.reduce((a, m) => a + m.real, 0);
  const spam = list.reduce((a, m) => a + m.spam, 0);
  const converted = list.reduce((a, m) => a + m.converted, 0);
  const weighted = list.reduce((a, m) => a + parseLen(m.avgLen) * m.calls, 0);
  const avgLen = calls ? formatLen(weighted / calls) : "0:00";
  return { calls, real, spam, converted, avgLen };
}

/** Resolve metrics for an agent + client selection ("all" = combined). */
export function metricsFor(
  agentId: string,
  clientId: string,
  range: RangeKey,
): AgentMetrics {
  const byClient = agentClientMetrics[agentId] ?? {};
  if (clientId === "all") {
    const agent = agents.find((a) => a.id === agentId);
    const served = agent?.servedClientIds ?? Object.keys(byClient);
    return combineMetrics(served.map((c) => byClient[c][range]));
  }
  return byClient[clientId][range];
}

/* ── Leads & recent calls ── */

export type Lead = {
  id: string;
  name: string;
  phone: string;
  status: Status;
  score: number;
  intent: string;
  dur: string;
  agent: "Nora" | "Bob" | "Imported"; // "Imported" = uploaded, not a voice call
  ts: string; // ISO timestamp (sortable + for date-range filtering)
  when: string; // human display
  stage: Stage;
  assigneeId: string | null;
  clientId?: string | null; // set when the lead was imported for a client

  // Enrichment from Supabase (real ElevenLabs calls); absent on mock/demo leads.
  conversationId?: string | null;
  summary?: string | null;
  durationSecs?: number | null;
  hasAudio?: boolean | null;
  transcript?: { t: string; who: "agent" | "caller"; text: string }[] | null;
  dataFields?: Record<string, { value?: unknown; rationale?: string }> | null;
  qualification?: Record<string, { result?: string; rationale?: string }> | null;
};

// Decorative waveform shape for the recording player (visual only).
export const waveform = Array.from({ length: 64 }, (_, i) => ({
  h: 8 + Math.round(Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.45)) * 28),
  color: i < 18 ? "var(--color-brand)" : "var(--color-brand-bar-soft)",
}));

