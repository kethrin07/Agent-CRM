"use client";

import { useRef, useState } from "react";
import { CheckIcon, CloseIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LeadLifecycle } from "@/components/LeadLifecycle";
import { LeadNotes } from "@/components/LeadNotes";
import { LeadActions, CopyTranscriptButton } from "@/components/LeadActions";
import { RecordingPlayer } from "@/components/RecordingPlayer";
import { StatusBadge } from "@/components/ui/Badge";
import { useLead } from "@/lib/leads-store";
import { useRole } from "@/lib/role";
import { clientName } from "@/lib/data";

type Line = { t: string; who: "agent" | "caller"; text: string };

// Friendly labels for the agent's data-collection / evaluation keys.
const FIELD_LABELS: Record<string, string> = {
  homeowner_name: "Name",
  homeowner_phone_number: "Phone",
  homeowner_zip_code: "ZIP code",
  project_type: "Project type",
  project_description: "Project",
  consent_to_contact: "Consent to contact",
};
const prettify = (k: string) =>
  k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const fmtValue = (v: unknown) =>
  typeof v === "boolean" ? (v ? "Yes" : "No") : String(v);

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

  // Playback position (from the recording player) → transcript highlight.
  const [audioTime, setAudioTime] = useState(0);
  const seekRef = useRef<((t: number) => void) | null>(null);

  if (!lead) {
    return <div className="text-sm text-muted">Lead not found.</div>;
  }

  // Real calls have a conversation id (CSV imports don't → no recording).
  const isReal = Boolean(lead.conversationId);
  const agentLabel = lead.agent === "Imported" ? "Agent" : lead.agent;

  const initials = lead.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Transcript lines from the stored conversation (empty when none).
  const lines: Line[] =
    lead.transcript && lead.transcript.length ? lead.transcript : [];
  const transcriptText = lines
    .map((l) => `${l.t}  ${l.who === "agent" ? agentLabel : "Caller"}: ${l.text}`)
    .join("\n");

  // Which transcript line is "now" for the current playback position.
  const parseT = (t: string) => {
    const [m, s] = t.split(":").map(Number);
    return (m || 0) * 60 + (s || 0);
  };
  const lineStarts = lines.map((l) => parseT(l.t));
  let activeIdx = -1;
  for (let i = 0; i < lineStarts.length; i++) {
    if (lineStarts[i] <= audioTime + 0.25) activeIdx = i;
    else break;
  }

  // Collected lead details from the agent's data-collection results.
  const realFields = lead.dataFields
    ? Object.entries(lead.dataFields)
        .filter(([, f]) => f?.value != null && String(f.value).trim() !== "")
        .map(([k, f]) => ({ k: FIELD_LABELS[k] ?? prettify(k), v: fmtValue(f.value) }))
    : [];
  const fields = realFields;

  // Qualification checks from evaluation_criteria_results.
  const realChecks = lead.qualification
    ? Object.entries(lead.qualification).map(([k, q]) => ({
        label: FIELD_LABELS[k] ?? prettify(k),
        pass: (q?.result ?? "").toLowerCase() === "success",
      }))
    : [];

  const summary = lead.summary || "No summary available.";

  // Show the recording player for real calls, unless the call has no audio.
  const showPlayer = isReal && lead.hasAudio !== false;

  const callInfo = [
    ...(lead.conversationId
      ? [{ k: "Conversation ID", v: lead.conversationId, mono: true }]
      : []),
    { k: "Call length", v: lead.dur },
    { k: "Answered by", v: lead.agent },
    ...(lead.clientId ? [{ k: "Client", v: clientName(lead.clientId) }] : []),
  ];

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
              <p className="text-sm leading-relaxed text-sub">{summary}</p>
              {realChecks.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {realChecks.map((c) => (
                    <div key={c.label} className="flex items-center gap-2.5 text-sm">
                      <span
                        className={`flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full ${
                          c.pass
                            ? "bg-good-bg text-good-fg"
                            : "bg-bad-bg text-bad-fg"
                        }`}
                      >
                        {c.pass ? <CheckIcon /> : <CloseIcon size={13} />}
                      </span>
                      <span className="flex-grow">{c.label}</span>
                      <span
                        className={`text-xs font-semibold ${
                          c.pass ? "text-good-fg" : "text-bad-fg"
                        }`}
                      >
                        {c.pass ? "Pass" : "No"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-muted">
                  No qualification criteria recorded for this call.
                </p>
              )}
            </section>
          )}

          {/* Lead details */}
          <section className="flex flex-col gap-3.5 card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Lead details</h2>
              <span className="text-xs text-muted">Collected by {agentLabel}</span>
            </div>
            {fields.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-5 gap-y-3.5">
                {fields.map((f) => (
                  <div key={f.k} className="flex min-w-0 flex-col gap-[3px]">
                    <span className="text-xs text-muted">{f.k}</span>
                    <span className="text-sm font-medium [overflow-wrap:anywhere]">
                      {f.v}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-muted">
                No details were collected on this call.
              </p>
            )}
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
              <h2 className="text-base font-semibold">
                {showPlayer ? "Recording & transcript" : "Transcript"}
              </h2>
              {lines.length > 0 && <CopyTranscriptButton text={transcriptText} />}
            </div>
            {showPlayer &&
              (isReal ? (
                <RecordingPlayer
                  src={`/api/leads/${lead.conversationId}/audio`}
                  total={lead.durationSecs ?? undefined}
                  onTime={setAudioTime}
                  seekRef={seekRef}
                />
              ) : (
                <RecordingPlayer onTime={setAudioTime} seekRef={seekRef} />
              ))}
          </div>
          <div className="flex flex-col px-5 pb-5 pt-2">
            {lines.length > 0 ? (
              lines.map((l, i) => (
                <div
                  key={i}
                  onClick={() => seekRef.current?.(lineStarts[i])}
                  className={`grid cursor-pointer gap-3 border-b border-rowline py-3 text-sm leading-relaxed transition-colors [grid-template-columns:44px_60px_minmax(0,1fr)] ${
                    i === activeIdx ? "bg-brand-soft2" : "hover:bg-hover"
                  }`}
                >
                  <span className="pt-0.5 font-mono text-xs text-muted">{l.t}</span>
                  <span
                    className={`pt-px text-[13px] font-semibold ${
                      l.who === "agent" ? "text-brand" : "text-ink"
                    }`}
                  >
                    {l.who === "agent" ? agentLabel : "Caller"}
                  </span>
                  <span className="text-ink2">{l.text}</span>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-[13px] text-muted">
                No transcript captured for this call.
              </p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
