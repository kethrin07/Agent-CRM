"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MicIcon } from "@/components/icons";
import { Select } from "@/components/ui/Select";
import { useRole } from "@/lib/role";
import {
  agents,
  agentAccent,
  clientName,
  metricsFor,
  rangeOptions,
  rangeSubtitle,
  type RangeKey,
  type AgentMeta,
} from "@/lib/data";

const neutralAccent = {
  bg: "var(--color-neutral-bg)",
  fg: "var(--color-neutral-fg)",
};

const accentFor = (name: string) => agentAccent[name] ?? neutralAccent;

const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);

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

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[13px] font-medium text-sub">
        {label}
      </label>
      {children}
    </div>
  );
}

function StatusPill({ status }: { status: AgentMeta["status"] }) {
  const active = status === "active";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
        active ? "bg-good-bg text-good-fg" : "bg-warn-bg text-warn-fg"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${active ? "bg-good" : "bg-warn-bar"}`}
      />
      {active ? "Active" : "Paused"}
    </span>
  );
}

export default function AgentsPage() {
  const { role, hydrated } = useRole();
  const router = useRouter();

  const [agentId, setAgentId] = useState(agents[0].id);
  const [clientId, setClientId] = useState("all");
  const [range, setRange] = useState<RangeKey>("7d");

  useEffect(() => {
    if (hydrated && role !== "admin") router.replace("/");
  }, [hydrated, role, router]);

  if (role !== "admin") return null;

  const agent = agents.find((a) => a.id === agentId) ?? agents[0];

  // Client options depend on the selected agent's scope.
  const clientOptions =
    agent.scope === "general"
      ? [
          { value: "all", label: "All clients" },
          ...agent.servedClientIds.map((id) => ({
            value: id,
            label: clientName(id),
          })),
        ]
      : [{ value: agent.clientId!, label: clientName(agent.clientId!) }];

  // Guard against a stale clientId after switching agents.
  const effClientId = clientOptions.some((o) => o.value === clientId)
    ? clientId
    : clientOptions[0].value;

  // Selecting an agent resets the client selection to its sensible default.
  const selectAgent = (id: string) => {
    const next = agents.find((a) => a.id === id)!;
    setAgentId(id);
    setClientId(next.scope === "general" ? "all" : next.clientId!);
  };

  const m = metricsFor(agentId, effClientId, range);
  const accent = accentFor(agent.name);

  const scopeLine =
    agent.scope === "general"
      ? `General · ${effClientId === "all" ? "All clients" : clientName(effClientId)}`
      : clientName(agent.clientId!);

  const tiles = [
    { label: "Calls handled", value: m.calls },
    { label: "Real leads", value: m.real },
    { label: "Converted", value: m.converted },
  ];

  const generalAgents = agents.filter((a) => a.scope === "general");
  const clientGroups = Array.from(
    new Set(
      agents.filter((a) => a.scope === "client").map((a) => a.clientId!),
    ),
  ).map((cid) => ({
    id: cid,
    name: clientName(cid),
    list: agents.filter((a) => a.clientId === cid),
  }));

  // A compact roster row; selects the agent on click.
  const RosterCard = ({ a }: { a: AgentMeta }) => {
    const rm = metricsFor(
      a.id,
      a.scope === "general" ? "all" : a.clientId!,
      range,
    );
    const ra = accentFor(a.name);
    const selected = a.id === agentId;
    return (
      <button
        type="button"
        onClick={() => selectAgent(a.id)}
        className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
          selected
            ? "border-brand bg-brand-soft2"
            : "border-border bg-card hover:bg-hover"
        }`}
      >
        <span
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-semibold"
          style={{ background: ra.bg, color: ra.fg }}
        >
          {a.initial}
        </span>
        <div className="flex min-w-0 flex-grow flex-col">
          <span className="truncate text-sm font-semibold">{a.name}</span>
          <span className="truncate text-xs text-muted">{a.role}</span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="font-mono text-sm tabular-nums">
            {rm.calls.toLocaleString()}
          </span>
          <span className="text-xs text-muted">
            {pct(rm.real, rm.calls)}% real
          </span>
        </div>
      </button>
    );
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
            <MicIcon size={20} />
          </span>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-[26px] font-semibold leading-none tracking-[-0.02em]">
              Agents
            </h1>
            <div className="text-sm text-muted">
              Performance across all agents and clients {rangeSubtitle[range]}
            </div>
          </div>
        </div>
        <span className="hidden shell:inline-flex">
          <ThemeToggle compact />
        </span>
      </div>

      {/* Control bar */}
      <div className="card grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
        <Field label="Agent" htmlFor="agent">
          <Select
            id="agent"
            value={agentId}
            onChange={(e) => selectAgent(e.target.value)}
          >
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ·{" "}
                {a.scope === "general" ? "General" : clientName(a.clientId!)}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Client" htmlFor="client">
          <Select
            id="client"
            value={effClientId}
            disabled={agent.scope === "client"}
            onChange={(e) => setClientId(e.target.value)}
          >
            {clientOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Date range" htmlFor="range">
          <Select
            id="range"
            value={range}
            onChange={(e) => setRange(e.target.value as RangeKey)}
          >
            {rangeOptions.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {/* Metrics panel */}
      <section className="card flex flex-col gap-5 p-5 sm:p-6">
        {/* Identity */}
        <div className="flex flex-wrap items-center gap-3">
          <span
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-lg font-semibold"
            style={{ background: accent.bg, color: accent.fg }}
          >
            {agent.initial}
          </span>
          <div className="flex flex-col">
            <span className="text-lg font-semibold">{agent.name}</span>
            <span className="text-[13px] text-muted">
              {agent.role} · {scopeLine}
            </span>
          </div>
          <span className="ml-auto">
            <StatusPill status={agent.status} />
          </span>
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
            value={pct(m.real, m.calls)}
            color="var(--color-good)"
          />
          <Metric
            label="Spam filtered"
            value={pct(m.spam, m.calls)}
            color="var(--color-bad-bar)"
          />
          <Metric
            label="Conversion rate"
            value={pct(m.converted, m.real)}
            color="var(--color-brand)"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-hairline pt-3.5 text-sm">
          <span className="text-muted">Avg call length</span>
          <span className="font-mono font-medium">{m.avgLen}</span>
        </div>
      </section>

      {/* All-agents overview */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-muted">General agents</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {generalAgents.map((a) => (
              <RosterCard key={a.id} a={a} />
            ))}
          </div>
        </div>

        {clientGroups.map((g) => (
          <div key={g.id} className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-muted">{g.name}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {g.list.map((a) => (
                <RosterCard key={a.id} a={a} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
