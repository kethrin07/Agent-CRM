"use client";

import { useEffect, useMemo, useState, type MouseEvent } from "react";
import Link from "next/link";
import { SearchIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useLeadDrawer } from "@/components/LeadDrawer";
import { ImportLeadsDialog } from "@/components/ImportLeadsDialog";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { useLeads } from "@/lib/leads-store";
import { useRole } from "@/lib/role";
import {
  agentAccent,
  clientName,
  teamById,
  type Lead,
  type Status,
} from "@/lib/data";

type StatusFilter = "All" | Status;
type AgentFilter = "All agents" | "Nora" | "Bob";

const statusFilters: StatusFilter[] = ["All", "Real", "Unclear", "Spam"];
const agentFilters: AgentFilter[] = ["All agents", "Nora", "Bob"];

// `ts` is ISO; its date part ("YYYY-MM-DD") compares lexically against the
// native <input type="date"> values. Empty bound = open-ended.
const inRange = (l: Lead, from: string, to: string) => {
  const day = l.ts.slice(0, 10);
  return (!from || day >= from) && (!to || day <= to);
};

const chipClass = (on: boolean) =>
  `min-h-10 cursor-pointer rounded-full border px-3.5 text-[13px] font-medium transition-colors ${
    on
      ? "border-ink bg-ink text-page"
      : "border-border-strong bg-card text-ink hover:bg-hover"
  }`;

type SortKey = "name" | "status" | "score" | "dur" | "agent" | "when";
type Sort = { key: SortKey; dir: "asc" | "desc" };

const PAGE_SIZE = 8;
const durToSec = (d: string) => {
  const [m, s] = d.split(":").map(Number);
  return (m || 0) * 60 + (s || 0);
};
// Numeric columns default to largest-first; text columns to A→Z.
const defaultDir = (k: SortKey): "asc" | "desc" =>
  k === "score" || k === "dur" || k === "when" ? "desc" : "asc";

export default function LeadsPage() {
  const { leads } = useLeads();
  const toast = useToast();
  const { open } = useLeadDrawer();
  const { role } = useRole();

  // Local mounted flag (not the shared provider one) so server + first client
  // render match; the admin-only Import button appears after hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isAdmin = mounted && role === "admin";
  const [importOpen, setImportOpen] = useState(false);

  const cols = "minmax(190px,2fr) 110px minmax(180px,2fr) 70px 100px 140px";

  // Plain left-click opens the drawer; modifier/middle clicks deep-link as usual.
  const openDrawer = (e: MouseEvent<HTMLElement>, id: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    open(id);
  };
  const [filter, setFilter] = useState<StatusFilter>("All");
  const [agent, setAgent] = useState<AgentFilter>("All agents");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>({ key: "when", dir: "desc" });
  const [page, setPage] = useState(1);

  // Min/max selectable days, derived from the data.
  const days = useMemo(() => leads.map((l) => l.ts.slice(0, 10)).sort(), [leads]);
  const minDay = days[0];
  const maxDay = days[days.length - 1];

  const byAgent = useMemo(
    () =>
      leads.filter(
        (l) =>
          (agent === "All agents" || l.agent === agent) && inRange(l, from, to),
      ),
    [agent, from, to, leads],
  );

  const exportCsv = () => {
    const headers = [
      "Name",
      "Phone",
      "Status",
      "Intent",
      "Length",
      "Agent",
      "Stage",
      "Owner",
      "Date",
    ];
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const lines = rows.map((r: Lead) =>
      [
        r.name,
        r.phone,
        r.status,
        r.intent,
        r.dur,
        r.agent,
        r.stage,
        teamById(r.assigneeId)?.name ?? "Unassigned",
        r.when,
      ]
        .map(esc)
        .join(","),
    );
    const csv = [headers.map(esc).join(","), ...lines].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "myhomequote-leads.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast(`Exported ${rows.length} lead${rows.length === 1 ? "" : "s"} to CSV`);
  };

  const rows = useMemo(() => {
    let r = filter === "All" ? byAgent : byAgent.filter((l) => l.status === filter);
    const q = query.trim().toLowerCase();
    if (q) {
      r = r.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.phone.toLowerCase().includes(q) ||
          l.intent.toLowerCase().includes(q),
      );
    }
    return r;
  }, [byAgent, filter, query]);

  const sorted = useMemo(() => {
    const dir = sort.dir === "asc" ? 1 : -1;
    const num = (l: Lead) =>
      sort.key === "score"
        ? l.score
        : sort.key === "dur"
          ? durToSec(l.dur)
          : null;
    return [...rows].sort((a, b) => {
      if (sort.key === "when") return a.ts.localeCompare(b.ts) * dir;
      const na = num(a);
      if (na !== null) return (na - (num(b) as number)) * dir;
      return String(a[sort.key]).localeCompare(String(b[sort.key])) * dir;
    });
  }, [rows, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const paged = sorted.slice(start, start + PAGE_SIZE);

  // Snap back to page 1 whenever the result set or ordering changes.
  useEffect(() => {
    setPage(1);
  }, [filter, agent, from, to, query, sort]);

  const toggleSort = (key: SortKey) =>
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: defaultDir(key) },
    );

  const countFor = (f: StatusFilter) =>
    f === "All" ? byAgent.length : byAgent.filter((l) => l.status === f).length;

  const hasFilters =
    filter !== "All" ||
    agent !== "All agents" ||
    Boolean(from) ||
    Boolean(to) ||
    Boolean(query.trim());

  const clearFilters = () => {
    setFilter("All");
    setAgent("All agents");
    setFrom("");
    setTo("");
    setQuery("");
  };

  const SortHeader = ({ label, k }: { label: string; k: SortKey }) => {
    const active = sort.key === k;
    return (
      <button
        type="button"
        onClick={() => toggleSort(k)}
        aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
        className={`flex items-center gap-1 text-left uppercase transition-colors hover:text-ink ${
          active ? "text-ink" : ""
        }`}
      >
        {label}
        <span className="text-[10px]">
          {active ? (sort.dir === "asc" ? "↑" : "↓") : ""}
        </span>
      </button>
    );
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[26px] font-semibold tracking-[-0.02em]">
            Leads &amp; calls
          </h1>
          <div className="text-sm text-muted">
            Every inbound call Nora and Bob answered, synced from ElevenLabs into
            Supabase
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden shell:inline-flex">
            <ThemeToggle compact />
          </span>
          {isAdmin && (
            <Button variant="primary" onClick={() => setImportOpen(true)}>
              Import leads
            </Button>
          )}
          <Button onClick={exportCsv}>Export CSV</Button>
        </div>
      </div>

      <ImportLeadsDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex min-h-11 max-w-[360px] flex-grow items-center gap-2 rounded-lg border border-border-strong bg-card px-3 text-muted focus-within:border-brand">
          <SearchIcon />
          <span className="sr-only">Search leads</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, phone or transcript"
            className="min-w-0 flex-grow bg-transparent text-sm text-ink outline-none"
          />
        </label>

        <div className="flex min-h-11 items-center gap-2 rounded-lg border border-border-strong bg-card px-3 text-sm text-ink">
          <input
            type="date"
            aria-label="From date"
            value={from}
            min={minDay}
            max={to || maxDay}
            onChange={(e) => setFrom(e.target.value)}
            className="bg-transparent text-sm text-ink outline-none"
          />
          <span className="text-muted">–</span>
          <input
            type="date"
            aria-label="To date"
            value={to}
            min={from || minDay}
            max={maxDay}
            onChange={(e) => setTo(e.target.value)}
            className="bg-transparent text-sm text-ink outline-none"
          />
          {(from || to) && (
            <button
              type="button"
              onClick={() => {
                setFrom("");
                setTo("");
              }}
              className="text-xs font-medium text-brand transition-colors hover:text-brand-hover"
            >
              Clear
            </button>
          )}
        </div>

        <div
          role="group"
          aria-label="Filter by status"
          className="flex flex-wrap gap-1.5"
        >
          {statusFilters.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={f === filter}
              onClick={() => setFilter(f)}
              className={chipClass(f === filter)}
            >
              {f} · {countFor(f)}
            </button>
          ))}
        </div>

        <div
          role="group"
          aria-label="Filter by agent"
          className="flex flex-wrap gap-1.5 border-l border-border-strong pl-1.5"
        >
          {agentFilters.map((a) => (
            <button
              key={a}
              type="button"
              aria-pressed={a === agent}
              onClick={() => setAgent(a)}
              className={chipClass(a === agent)}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <section className="card overflow-hidden">
        {/* Desktop table */}
        <div className="hidden overflow-x-auto shell:block">
          <div className="min-w-[960px]">
            <div
              className="grid gap-4 border-b border-hairline bg-hover px-5 py-3 text-xs font-semibold uppercase tracking-[0.04em] text-muted"
              style={{ gridTemplateColumns: cols }}
            >
              <SortHeader label="Lead" k="name" />
              <SortHeader label="Status" k="status" />
              <span>What they want</span>
              <SortHeader label="Length" k="dur" />
              <SortHeader label="Agent" k="agent" />
              <SortHeader label="Date" k="when" />
            </div>

            {paged.map((r) => {
              const accent = agentAccent[r.agent];
              return (
                <Link
                  key={r.id}
                  href={`/leads/${r.id}`}
                  onClick={(e) => openDrawer(e, r.id)}
                  style={{ gridTemplateColumns: cols }}
                  className="grid items-center gap-4 border-b border-row px-5 py-3.5 text-sm text-ink no-underline transition-colors last:border-b-0 hover:bg-hover hover:text-ink"
                >
                  <span className="flex flex-col gap-0.5">
                    <span className="font-semibold">{r.name}</span>
                    <span className="font-mono text-xs text-muted">{r.phone}</span>
                    {r.clientId && (
                      <span className="mt-0.5 w-fit rounded-full bg-hover px-1.5 py-0.5 text-[11px] font-medium text-muted">
                        {clientName(r.clientId)}
                      </span>
                    )}
                  </span>
                  <StatusBadge status={r.status} />
                  <span className="text-sub">{r.intent}</span>
                  <span className="font-mono text-sub">{r.dur}</span>
                  <span className="flex items-center gap-2 text-sub">
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold"
                      style={{ background: accent.bg, color: accent.fg }}
                    >
                      {r.agent[0]}
                    </span>
                    {r.agent}
                  </span>
                  <span className="text-muted">{r.when}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Mobile cards */}
        <div className="flex flex-col shell:hidden">
          {paged.map((r) => {
            const accent = agentAccent[r.agent];
            return (
              <Link
                key={r.id}
                href={`/leads/${r.id}`}
                onClick={(e) => openDrawer(e, r.id)}
                className="flex flex-col gap-2 border-b border-row px-4 py-3.5 text-ink no-underline transition-colors last:border-b-0 hover:bg-hover hover:text-ink"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate font-semibold">{r.name}</span>
                    <span className="font-mono text-xs text-muted">{r.phone}</span>
                    {r.clientId && (
                      <span className="mt-0.5 w-fit rounded-full bg-hover px-1.5 py-0.5 text-[11px] font-medium text-muted">
                        {clientName(r.clientId)}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-end gap-1">
                    <StatusBadge status={r.status} />
                  </div>
                </div>

                <div className="line-clamp-2 text-[13px] text-sub">{r.intent}</div>

                <div className="flex items-center gap-2 text-xs text-muted">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold"
                      style={{ background: accent.bg, color: accent.fg }}
                    >
                      {r.agent[0]}
                    </span>
                    {r.agent}
                  </span>
                  <span aria-hidden="true" className="text-border-strong">
                    ·
                  </span>
                  <span className="font-mono">{r.dur}</span>
                  <span className="ml-auto whitespace-nowrap">{r.when}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {rows.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-5 py-14 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-hover text-muted">
              <SearchIcon size={20} />
            </span>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-ink">No leads found</p>
              <p className="text-[13px] text-muted">
                {hasFilters
                  ? "No calls match your current filters."
                  : "Calls will appear here as they come in."}
              </p>
            </div>
            {hasFilters && (
              <Button size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 text-[13px] text-muted">
          <span>
            {sorted.length === 0
              ? "No results"
              : `Showing ${start + 1}–${Math.min(start + PAGE_SIZE, sorted.length)} of ${sorted.length}`}
            {filter === "All" && agent === "All agents" && !query.trim()
              ? ` · ${leads.length.toLocaleString()} calls total`
              : ""}
          </span>
          <div className="flex items-center gap-2">
            <span className="tabular-nums">
              Page {page} / {pageCount}
            </span>
            <Button
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              size="sm"
              disabled={page >= pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
