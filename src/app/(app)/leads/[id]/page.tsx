import Link from "next/link";
import { ChevronLeftIcon, CheckIcon, PlayIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LeadLifecycle } from "@/components/LeadLifecycle";
import { LeadActions, CopyTranscriptButton } from "@/components/LeadActions";
import { StatusBadge } from "@/components/ui/Badge";
import {
  leads,
  leadFields,
  qualificationChecks,
  transcript,
  waveform,
} from "@/lib/data";

// Fields mirror the ElevenLabs conversation payload (metadata + analysis)
const callInfo = [
  { k: "Called number", v: "+1 (888) 555-0140", mono: true },
  { k: "Conversation ID", v: "conv_8f2a91c4e7", mono: true },
  { k: "Call success", v: "Success" }, // analysis.call_successful
  { k: "Saved to", v: "supabase.leads", mono: true },
];

export default async function LeadDetailPage({
  params,
}: PageProps<"/leads/[id]">) {
  const { id } = await params;
  const lead = leads.find((l) => l.id === id) ?? leads[0];
  const initials = lead.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const transcriptText = transcript
    .map(([t, who, txt]) => `${t}  ${who === "agent" ? "Nora" : "Caller"}: ${txt}`)
    .join("\n");

  return (
    <>
      <Link
        href="/leads"
        className="flex min-h-8 items-center gap-1.5 self-start text-sm no-underline"
      >
        <ChevronLeftIcon />
        All leads
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-nora-bg text-xl font-semibold text-nora-fg">
            {initials}
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-[26px] font-semibold tracking-[-0.02em]">
                {lead.name}
              </h1>
              <StatusBadge
                status={lead.status}
                label={lead.status === "Real" ? "Real lead" : lead.status}
              />
            </div>
            <div className="text-sm text-muted">
              Inbound call · {lead.when} · {lead.dur} · Answered by {lead.agent}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="hidden shell:inline-flex">
            <ThemeToggle compact />
          </span>
          <LeadActions id={lead.id} />
        </div>
      </div>

      {/* Two-column grid */}
      <div className="grid items-start gap-5 [grid-template-columns:repeat(auto-fit,minmax(360px,1fr))]">
        {/* Left column */}
        <div className="flex flex-col gap-5">
          {/* Lifecycle (stage + owner) */}
          <LeadLifecycle id={lead.id} />

          {/* AI verdict */}
          <section className="flex flex-col gap-3.5 card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">AI verdict</h2>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-[28px] font-semibold">
                  {lead.score}
                </span>
                <span className="text-[13px] text-muted">/ 100</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-sub">
              Linda owns a single-family home in Austin (78704), built in 1998 and
              worth about $450k. Her current policy renews in May and the price went
              up, so she is shopping around. She gave a working email and prefers a
              callback in the morning.
            </p>
            <div className="flex flex-col gap-2">
              {qualificationChecks.map((label) => (
                <div key={label} className="flex items-center gap-2.5 text-sm">
                  <span className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full bg-good-bg text-good-fg">
                    <CheckIcon />
                  </span>
                  <span className="flex-grow">{label}</span>
                  <span className="text-xs font-semibold text-good-fg">Pass</span>
                </div>
              ))}
            </div>
          </section>

          {/* Lead details */}
          <section className="flex flex-col gap-3.5 card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Lead details</h2>
              <span className="text-xs text-muted">Collected by Nora</span>
            </div>
            <div className="grid grid-cols-2 gap-x-5 gap-y-3.5">
              {leadFields.map((f) => (
                <div key={f.k} className="flex min-w-0 flex-col gap-[3px]">
                  <span className="text-xs text-muted">{f.k}</span>
                  <span className="text-sm font-medium [overflow-wrap:anywhere]">
                    {f.v}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Call info */}
          <section className="flex flex-col gap-3 card p-5">
            <h2 className="text-base font-semibold">Call info</h2>
            <div className="flex flex-col gap-2.5 text-[13px]">
              {callInfo.map((row) => (
                <div key={row.k} className="flex justify-between gap-3">
                  <span className="text-muted">{row.k}</span>
                  <span className={row.mono ? "font-mono" : undefined}>{row.v}</span>
                </div>
              ))}
            </div>
            <label className="mt-1 flex flex-col gap-1.5 text-[13px] font-medium">
              Your notes
              <textarea
                rows={3}
                placeholder="Add a note for your team"
                className="resize-y rounded-lg border border-border-strong px-3 py-2.5 text-sm font-normal outline-none"
              />
            </label>
          </section>
        </div>

        {/* Right column: recording & transcript */}
        <section className="flex flex-col overflow-hidden card">
          <div className="flex flex-col gap-3.5 border-b border-hairline px-5 py-[18px]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Recording &amp; transcript</h2>
              <CopyTranscriptButton text={transcriptText} />
            </div>
            <div className="flex items-center gap-3.5">
              <button
                type="button"
                aria-label="Play recording"
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand text-white"
              >
                <PlayIcon />
              </button>
              <div className="flex h-10 min-w-0 flex-grow items-center gap-0.5 overflow-hidden">
                {waveform.map((w, i) => (
                  <div
                    key={i}
                    className="min-w-0.5 flex-grow basis-0 rounded-sm"
                    style={{ height: w.h, background: w.color }}
                  />
                ))}
              </div>
              <span className="flex-shrink-0 font-mono text-xs text-muted">
                0:22 / 1:18
              </span>
            </div>
          </div>
          <div className="flex flex-col px-5 pb-5 pt-2">
            {transcript.map(([t, who, text], i) => (
              <div
                key={i}
                className="grid gap-3 border-b border-rowline py-3 text-sm leading-relaxed [grid-template-columns:44px_60px_minmax(0,1fr)]"
              >
                <span className="pt-0.5 font-mono text-xs text-muted">{t}</span>
                <span
                  className={`pt-px text-[13px] font-semibold ${
                    who === "agent" ? "text-brand" : "text-ink"
                  }`}
                >
                  {who === "agent" ? "Nora" : "Caller"}
                </span>
                <span className="text-ink2">{text}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
