"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SearchIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { useToast } from "@/components/ui/Toast";
import { useLeads } from "@/lib/leads-store";
import {
  agentAccent,
  statusStyle,
  teamById,
  totalCalls,
  type Lead,
  type Status,
} from "@/lib/data";

type StatusFilter = "All" | Status;
type AgentFilter = "All agents" | "Nora" | "Bob";

const statusFilters: StatusFilter[] = ["All", "Real", "Unclear", "Spam"];
const agentFilters: AgentFilter[] = ["All agents", "Nora", "Bob"];

const chipClass = (on: boolean) =>
  `min-h-10 cursor-pointer rounded-full border px-3.5 text-[13px] font-medium transition-colors ${
    on
      ? "border-ink bg-ink text-white"
      : "border-border-strong bg-card text-ink hover:bg-hover"
  }`;

export default function LeadsPage() {
  const { leads } = useLeads();
  const toast = useToast();
  const [filter, setFilter] = useState<StatusFilter>("All");
  const [agent, setAgent] = useState<AgentFilter>("All agents");
  const [query, setQuery] = useState("");

  const byAgent = useMemo(
    () => (agent === "All agents" ? leads : leads.filter((l) => l.agent === agent)),
    [agent, leads],
  );

  const exportCsv = () => {
    const headers = [
      "Name",
      "Phone",
      "Status",
      "AI score",
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
        r.score,
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

  const countFor = (f: StatusFilter) =>
    f === "All" ? byAgent.length : byAgent.filter((l) => l.status === f).length;

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
          <Button onClick={exportCsv}>Export CSV</Button>
        </div>
      </div>

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
        <div className="overflow-x-auto">
          <div className="min-w-[960px]">
            <div className="grid gap-4 border-b border-hairline bg-hover px-5 py-3 text-xs font-semibold uppercase tracking-[0.04em] text-muted [grid-template-columns:minmax(190px,2fr)_110px_90px_minmax(180px,2fr)_70px_100px_140px]">
              <span>Lead</span>
              <span>Status</span>
              <span>AI score</span>
              <span>What they want</span>
              <span>Length</span>
              <span>Agent</span>
              <span>Date</span>
            </div>

            {rows.map((r) => {
              const accent = agentAccent[r.agent];
              return (
                <Link
                  key={r.id}
                  href={`/leads/${r.id}`}
                  className="grid items-center gap-4 border-b border-row px-5 py-3.5 text-sm text-ink no-underline transition-colors last:border-b-0 hover:bg-hover hover:text-ink [grid-template-columns:minmax(190px,2fr)_110px_90px_minmax(180px,2fr)_70px_100px_140px]"
                >
                  <span className="flex flex-col gap-0.5">
                    <span className="font-semibold">{r.name}</span>
                    <span className="font-mono text-xs text-muted">{r.phone}</span>
                  </span>
                  <StatusBadge status={r.status} />
                  <ScoreBar score={r.score} color={statusStyle[r.status].bar} />
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

            {rows.length === 0 && (
              <div className="px-5 py-10 text-center text-sm text-muted">
                No leads with this status
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 text-[13px] text-muted">
          <span>
            Showing {rows.length} of {totalCalls} calls
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => toast("You’re on the first page", { variant: "info" })}
            >
              Previous
            </Button>
            <Button
              size="sm"
              onClick={() =>
                toast("That’s all the leads for now", { variant: "info" })
              }
            >
              Next
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
