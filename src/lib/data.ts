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

const spark = {
  inbound: [133, 149, 153, 162, 165, 120, 150],
  real: [52, 61, 58, 70, 66, 49, 62],
  spam: [46, 44, 52, 41, 48, 33, 39],
  avg: [150, 162, 158, 171, 168, 159, 168],
};

export const kpisByRange: Record<RangeKey, Kpi[]> = {
  "24h": [
    { id: "inbound", label: "Inbound calls", value: "168", trend: { dir: "up", label: "+8%", tone: "pos" }, sub: "vs previous 24 hours", spark: spark.inbound },
    { id: "real", label: "Real leads", value: "69", trend: { dir: "up", label: "+5%", tone: "pos" }, sub: "41% of all calls", spark: spark.real },
    { id: "spam", label: "Spam or junk", value: "47", trend: { dir: "down", label: "-2%", tone: "pos" }, sub: "Filtered before your team", spark: spark.spam },
    { id: "avg", label: "Avg call length", value: "2m 41s", trend: { dir: "up", label: "+4s", tone: "neutral" }, sub: "Real leads only: 3m 22s", spark: spark.avg },
  ],
  "7d": [
    { id: "inbound", label: "Inbound calls", value: "1,042", trend: { dir: "up", label: "+12%", tone: "pos" }, sub: "vs previous 7 days", spark: spark.inbound },
    { id: "real", label: "Real leads", value: "418", trend: { dir: "up", label: "+6%", tone: "pos" }, sub: "40% of all calls", spark: spark.real },
    { id: "spam", label: "Spam or junk", value: "287", trend: { dir: "down", label: "-4%", tone: "pos" }, sub: "Filtered before your team", spark: spark.spam },
    { id: "avg", label: "Avg call length", value: "2m 48s", trend: { dir: "up", label: "+9s", tone: "neutral" }, sub: "Real leads only: 3m 31s", spark: spark.avg },
  ],
  "30d": [
    { id: "inbound", label: "Inbound calls", value: "4,310", trend: { dir: "up", label: "+15%", tone: "pos" }, sub: "vs previous 30 days", spark: spark.inbound },
    { id: "real", label: "Real leads", value: "1,724", trend: { dir: "up", label: "+9%", tone: "pos" }, sub: "40% of all calls", spark: spark.real },
    { id: "spam", label: "Spam or junk", value: "1,190", trend: { dir: "down", label: "-6%", tone: "pos" }, sub: "Filtered before your team", spark: spark.spam },
    { id: "avg", label: "Avg call length", value: "2m 52s", trend: { dir: "up", label: "+12s", tone: "neutral" }, sub: "Real leads only: 3m 34s", spark: spark.avg },
  ],
};

// Default range used by any non-interactive consumer (e.g. skeleton sizing).
export const kpis = kpisByRange["7d"];

// Conversion funnel: inbound call → closed customer, per range.
export type FunnelStep = { label: string; value: number; color: string };

const funnelLabels = [
  "Inbound calls",
  "Real leads",
  "Contacted",
  "Quoted",
  "Converted",
];
// Single blue ramp (pale → deep) so the funnel reads as one progression.
const funnelColors = [
  "#C2D1EF",
  "#98B4EA",
  "#6588DE",
  "#3E65D2",
  "#2149BE",
];
const mkFunnel = (vals: number[]): FunnelStep[] =>
  vals.map((value, i) => ({
    label: funnelLabels[i],
    value,
    color: funnelColors[i],
  }));

export const funnelByRange: Record<RangeKey, FunnelStep[]> = {
  "24h": mkFunnel([168, 69, 58, 35, 16]),
  "7d": mkFunnel([1042, 418, 356, 214, 103]),
  "30d": mkFunnel([4310, 1724, 1470, 884, 425]),
};
export const funnel = funnelByRange["7d"];

// Call volume chart, per range. [label, realLeads, spam/unclear]; most recent
// on the right. Buckets differ by range: hourly (24h), daily (7d), weekly (30d).
export type CallBar = {
  day: string;
  real: number;
  other: number;
  total: number;
  realH: number;
  otherH: number;
};

const callsRawByRange: Record<RangeKey, [string, number, number][]> = {
  "24h": [
    ["12am", 4, 6],
    ["3am", 3, 5],
    ["6am", 5, 8],
    ["9am", 9, 14],
    ["12pm", 11, 16],
    ["3pm", 12, 17],
    ["6pm", 13, 18],
    ["Now", 12, 15],
  ],
  "7d": [
    ["Oct 10", 52, 81],
    ["Oct 11", 61, 88],
    ["Oct 12", 58, 95],
    ["Oct 13", 70, 92],
    ["Oct 14", 66, 99],
    ["Oct 15", 49, 71],
    ["Today", 62, 88],
  ],
  "30d": [
    ["Sep 22", 300, 450],
    ["Sep 29", 330, 500],
    ["Oct 6", 350, 520],
    ["Oct 13", 360, 540],
    ["This week", 384, 576],
  ],
};

// Scale each range's tallest bar to ~150px within the 200px chart.
const buildBars = (raw: [string, number, number][]): CallBar[] => {
  const max = Math.max(...raw.map(([, r, o]) => r + o));
  const f = 150 / max;
  return raw.map(([day, real, other]) => ({
    day,
    real,
    other,
    total: real + other,
    realH: Math.round(real * f),
    otherH: Math.round(other * f),
  }));
};

export const callsPerDayByRange: Record<RangeKey, CallBar[]> = {
  "24h": buildBars(callsRawByRange["24h"]),
  "7d": buildBars(callsRawByRange["7d"]),
  "30d": buildBars(callsRawByRange["30d"]),
};
export const callsPerDay = callsPerDayByRange["7d"];

export const chartTitle: Record<RangeKey, string> = {
  "24h": "Calls by hour",
  "7d": "Calls per day",
  "30d": "Calls per week",
};

export type QualitySlice = {
  label: string;
  count: number;
  pct: number;
  color: string;
};

export const leadQualityByRange: Record<RangeKey, QualitySlice[]> = {
  "24h": [
    { label: "Real lead", count: 69, pct: 41, color: "var(--color-good)" },
    { label: "Unclear", count: 52, pct: 31, color: "var(--color-warn-bar)" },
    { label: "Spam", count: 47, pct: 28, color: "var(--color-bad-bar)" },
  ],
  "7d": [
    { label: "Real lead", count: 418, pct: 40, color: "var(--color-good)" },
    { label: "Unclear", count: 337, pct: 32, color: "var(--color-warn-bar)" },
    { label: "Spam", count: 287, pct: 28, color: "var(--color-bad-bar)" },
  ],
  "30d": [
    { label: "Real lead", count: 1724, pct: 40, color: "var(--color-good)" },
    { label: "Unclear", count: 1396, pct: 32, color: "var(--color-warn-bar)" },
    { label: "Spam", count: 1190, pct: 28, color: "var(--color-bad-bar)" },
  ],
};
export const leadQuality = leadQualityByRange["7d"];

export const agentsSummary = [
  {
    name: "Nora",
    initial: "N",
    role: "Main line",
    number: "+1 (888) 555-0140",
    calls: 612,
  },
  {
    name: "Bob",
    initial: "B",
    role: "Overflow & after-hours",
    number: "+1 (888) 555-0177",
    calls: 430,
  },
];

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
};

export const agents: AgentMeta[] = [
  { id: "nora", name: "Nora", initial: "N", role: "Main line", scope: "general", clientId: null, servedClientIds: ["acme", "bluebird"], status: "active", number: "+1 (888) 555-0140" },
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

const slug = (name: string, i: number) =>
  name.toLowerCase().replace(/[^a-z]+/g, "-").replace(/(^-|-$)/g, "") || `lead-${i}`;

export const leads: Lead[] = [
  { name: "Linda Carter", phone: "+1 512 555 0182", status: "Real", score: 87, intent: "Policy renewing, price went up", dur: "1:18", agent: "Nora", ts: "2026-10-16T14:41:00", when: "Oct 16, 2:41 PM", stage: "Contacted", assigneeId: "maya" },
  { name: "Unknown caller", phone: "+1 213 555 0147", status: "Spam", score: 3, intent: "Robocall / silence", dur: "0:07", agent: "Bob", ts: "2026-10-16T14:22:00", when: "Oct 16, 2:22 PM", stage: "New", assigneeId: null },
  { name: "James Patel", phone: "+1 469 555 0193", status: "Real", score: 92, intent: "Buying a home, closing soon", dur: "3:05", agent: "Nora", ts: "2026-10-15T13:58:00", when: "Oct 15, 1:58 PM", stage: "Quoted", assigneeId: "devin" },
  { name: "Dale Cooper", phone: "+1 206 555 0110", status: "Unclear", score: 42, intent: "Asked about rates, hung up", dur: "0:47", agent: "Bob", ts: "2026-10-15T09:30:00", when: "Oct 15, 9:30 AM", stage: "New", assigneeId: null },
  { name: "Rosa Jimenez", phone: "+1 305 555 0166", status: "Real", score: 79, intent: "Switching from current insurer", dur: "2:36", agent: "Nora", ts: "2026-10-14T12:12:00", when: "Oct 14, 12:12 PM", stage: "Contacted", assigneeId: "priya" },
  { name: "Kevin Brooks", phone: "+1 617 555 0121", status: "Spam", score: 8, intent: "Selling roofing leads", dur: "0:31", agent: "Nora", ts: "2026-10-13T11:40:00", when: "Oct 13, 11:40 AM", stage: "New", assigneeId: null },
  { name: "Angela Wu", phone: "+1 415 555 0175", status: "Real", score: 83, intent: "Condo, needs HO-6 quote", dur: "2:58", agent: "Bob", ts: "2026-10-11T10:05:00", when: "Oct 11, 10:05 AM", stage: "New", assigneeId: "devin" },
  { name: "Tom Reyes", phone: "+1 702 555 0139", status: "Unclear", score: 55, intent: "Renter, asked about home policy", dur: "0:52", agent: "Bob", ts: "2026-10-09T23:47:00", when: "Oct 9, 11:47 PM", stage: "Lost", assigneeId: "priya" },
  { name: "Hannah Scott", phone: "+1 312 555 0104", status: "Real", score: 88, intent: "Bundle home and auto", dur: "4:20", agent: "Nora", ts: "2026-10-07T17:15:00", when: "Oct 7, 5:15 PM", stage: "Won", assigneeId: "maya" },
  { name: "Silent caller", phone: "+1 646 555 0158", status: "Spam", score: 2, intent: "No response on the line", dur: "0:05", agent: "Bob", ts: "2026-10-03T21:02:00", when: "Oct 3, 9:02 PM", stage: "New", assigneeId: null },
].map((r, i) => ({ id: slug(r.name, i), ...(r as Omit<Lead, "id">) }));

export const recentCalls = leads.slice(0, 5);

export const totalCalls = "1,042";

/* ── Lead detail (Linda Carter) ── */

export const transcript: [string, "agent" | "caller", string][] = [
  ["0:00", "agent", "Hi, thanks for calling MyHomeQuote, this is Nora. Are you looking for a home insurance quote today?"],
  ["0:05", "caller", "Yes, hi. My policy renews in May and the price went up a lot."],
  ["0:11", "agent", "Sorry to hear that. Let’s see if we can find you something better. Can I get your name?"],
  ["0:15", "caller", "Linda Carter."],
  ["0:18", "agent", "Thanks, Linda. What’s the ZIP code of the home?"],
  ["0:22", "caller", "78704."],
  ["0:25", "agent", "Got it. Is it a single-family house, a condo or a townhome? And do you own it?"],
  ["0:31", "caller", "Single-family, and yes, I own it. Built in 1998, I think."],
  ["0:36", "agent", "Great. Roughly what do you think the home is worth?"],
  ["0:41", "caller", "Around four hundred and fifty thousand."],
  ["0:46", "agent", "And how long have you been with your current insurer?"],
  ["0:50", "caller", "About six years. I’d rather not say who."],
  ["0:54", "agent", "No problem at all. What’s the best email to send your quotes to?"],
  ["0:58", "caller", "linda.carter@email.com"],
  ["1:04", "agent", "Thank you. A licensed agent will call you back with quotes. Is this number the best way to reach you?"],
  ["1:10", "caller", "Yes, mornings work best."],
  ["1:13", "agent", "Perfect, you’re all set, Linda. Have a great day!"],
];

export const waveform = Array.from({ length: 64 }, (_, i) => ({
  h: 8 + Math.round(Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.45)) * 28),
  color: i < 18 ? "var(--color-brand)" : "var(--color-brand-bar-soft)",
}));

export const qualificationChecks = [
  "Real person (not a robocall or silence)",
  "Wants a home insurance quote",
  "Owns the home or is buying one",
  "Gave a valid phone or email",
];

export const leadFields = [
  { k: "Full name", v: "Linda Carter" },
  { k: "Phone", v: "+1 512 555 0182" },
  { k: "Email", v: "linda.carter@email.com" },
  { k: "ZIP code", v: "78704" },
  { k: "Home type", v: "Single-family, owner" },
  { k: "Year built", v: "1998" },
  { k: "Home value", v: "$450,000" },
  { k: "Current insurer", v: "Not shared, 6 years" },
  { k: "Renewal date", v: "May" },
  { k: "Best time to call", v: "Mornings" },
];
