import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { Sparkline } from "@/components/ui/Sparkline";
import { TrendChip, sparkColor } from "@/components/ui/TrendChip";
import {
  agentAccent,
  agentsSummary,
  callsPerDay,
  kpis,
  leadQuality,
  recentCalls,
} from "@/lib/data";

export default function OverviewPage() {
  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[26px] font-semibold tracking-[-0.02em]">Overview</h1>
          <div className="text-sm text-muted">
            How Nora and Bob handled inbound calls over the last 7 days
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button>Last 7 days</Button>
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
                id={k.id}
                points={k.spark}
                color={sparkColor[k.trend.tone]}
                className="h-8 w-[88px] flex-shrink-0"
              />
            </div>
            <div className="text-xs text-muted2">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Chart + quality */}
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(340px,1fr))]">
        {/* Calls per day */}
        <section className="card flex flex-col gap-[18px] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Calls per day</h2>
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
            {callsPerDay.map((d) => (
              <div
                key={d.day}
                className="group flex h-full flex-grow basis-0 flex-col justify-end gap-0.5"
              >
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
            {callsPerDay.map((d) => (
              <div
                key={d.day}
                className="flex-grow basis-0 text-center text-xs text-muted"
              >
                {d.day}
              </div>
            ))}
          </div>
        </section>

        {/* Lead quality */}
        <section className="card flex flex-col gap-4 p-5">
          <h2 className="text-base font-semibold">Lead quality</h2>
          {leadQuality.map((q) => (
            <div key={q.label} className="flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span>{q.label}</span>
                <span className="font-mono text-muted2">
                  {q.count} · {q.pct}%
                </span>
              </div>
              <div className="h-2 rounded bg-track">
                <div
                  className="h-2 rounded"
                  style={{ width: `${q.pct}%`, background: q.color }}
                />
              </div>
            </div>
          ))}

          <div className="flex flex-col gap-2.5 border-t border-hairline pt-3.5">
            <div className="text-[13px] font-semibold">Agents on the line</div>
            {agentsSummary.map((a) => {
              const accent = agentAccent[a.name];
              return (
                <Link
                  key={a.name}
                  href="/agent"
                  className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-1.5 text-ink no-underline transition-colors hover:bg-hover hover:text-ink"
                >
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-semibold"
                    style={{ background: accent.bg, color: accent.fg }}
                  >
                    {a.initial}
                  </div>
                  <div className="flex flex-grow flex-col gap-0.5 text-[13px]">
                    <span className="font-semibold">
                      {a.name} · {a.role}
                    </span>
                    <span className="text-muted">
                      {a.number} · {a.calls} calls this week
                    </span>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs text-good-fg">
                    <span className="h-2 w-2 rounded-full bg-good" />
                    Live
                  </span>
                </Link>
              );
            })}
          </div>
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
            {recentCalls.map((r) => (
              <Link
                key={r.id}
                href={`/leads/${r.id}`}
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
