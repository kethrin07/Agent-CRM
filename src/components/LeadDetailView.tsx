"use client";

import { CheckIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LeadLifecycle } from "@/components/LeadLifecycle";
import { LeadNotes } from "@/components/LeadNotes";
import { LeadActions, CopyTranscriptButton } from "@/components/LeadActions";
import { RecordingPlayer } from "@/components/RecordingPlayer";
import { StatusBadge } from "@/components/ui/Badge";
import { useLead } from "@/lib/leads-store";
import { useRole } from "@/lib/role";
import { leadFields, qualificationChecks, transcript } from "@/lib/data";

// Fields mirror the ElevenLabs conversation payload (metadata + analysis)
const callInfo = [
  { k: "Called number", v: "+1 (888) 555-0140", mono: true },
  { k: "Conversation ID", v: "conv_8f2a91c4e7", mono: true },
  { k: "Call success", v: "Success" }, // analysis.call_successful
  { k: "Saved to", v: "supabase.leads", mono: true },
];

const transcriptText = transcript
  .map(([t, who, txt]) => `${t}  ${who === "agent" ? "Nora" : "Caller"}: ${txt}`)
  .join("\n");

export function LeadDetailView({
  id,
  variant = "page",
}: {
  id: string;
  variant?: "page" | "drawer";
}) {
  const lead = useLead(id);
  const { role } = useRole();
  const isAdmin = role === "admin";

  if (!lead) {
    return <div className="text-sm text-muted">Lead not found.</div>;
  }

  const initials = lead.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-nora-bg text-xl font-semibold text-nora-fg">
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
          {variant === "page" && (
            <span className="hidden shell:inline-flex">
              <ThemeToggle compact />
            </span>
          )}
          <LeadActions id={lead.id} />
        </div>
      </div>

      {/* Two-column grid (stacks automatically in the narrow drawer) */}
      <div className="grid items-start gap-5 [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
        {/* Left column */}
        <div className="flex flex-col gap-5">
          <LeadLifecycle id={lead.id} />

          {/* AI verdict (admin only) */}
          {isAdmin && (
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
                worth about $450k. Her current policy renews in May and the price
                went up, so she is shopping around. She gave a working email and
                prefers a callback in the morning.
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
          )}

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
            <LeadNotes id={lead.id} />
          </section>
        </div>

        {/* Right column: recording & transcript */}
        <section className="flex flex-col overflow-hidden card">
          <div className="flex flex-col gap-3.5 border-b border-hairline px-5 py-[18px]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Recording &amp; transcript</h2>
              <CopyTranscriptButton text={transcriptText} />
            </div>
            <RecordingPlayer />
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
