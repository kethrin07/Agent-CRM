import Link from "next/link";
import { ChevronLeftIcon, CheckIcon, PlayIcon } from "@/components/icons";
import { leadFields, qualificationChecks, transcript, waveform } from "@/lib/data";

const callInfo = [
  { k: "Called number", v: "+1 (888) 555-0140", mono: true },
  { k: "Conversation ID", v: "conv_8f2a91c4e7", mono: true },
  { k: "Sentiment", v: "Positive" },
  { k: "Ended by", v: "Agent, goal reached" },
  { k: "Saved to", v: "supabase.leads", mono: true },
];

export default function LeadDetailPage() {
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
            LC
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-[26px] font-semibold tracking-[-0.02em]">
                Linda Carter
              </h1>
              <span className="rounded-full bg-good-bg px-2.5 py-1 text-xs font-semibold text-good-fg">
                Real lead
              </span>
            </div>
            <div className="text-sm text-muted">
              Inbound call · Today, 2:41 PM · 1m 18s · Answered by Nora on the main
              line
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="min-h-11 rounded-lg border border-border-strong bg-card px-4 text-sm text-bad-fg"
          >
            Mark as spam
          </button>
          <button
            type="button"
            className="min-h-11 rounded-lg border border-border-strong bg-card px-4 text-sm text-ink"
          >
            Assign
          </button>
          <button
            type="button"
            className="min-h-11 rounded-lg bg-brand px-[18px] text-sm font-semibold text-white"
          >
            Call back
          </button>
        </div>
      </div>

      {/* Two-column grid */}
      <div className="grid items-start gap-5 [grid-template-columns:repeat(auto-fit,minmax(360px,1fr))]">
        {/* Left column */}
        <div className="flex flex-col gap-5">
          {/* AI verdict */}
          <section className="flex flex-col gap-3.5 rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">AI verdict</h2>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-[28px] font-semibold">87</span>
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
          <section className="flex flex-col gap-3.5 rounded-xl border border-border bg-card p-5">
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
          <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
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
        <section className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex flex-col gap-3.5 border-b border-hairline px-5 py-[18px]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Recording &amp; transcript</h2>
              <button
                type="button"
                className="min-h-9 rounded-lg border border-border-strong bg-card px-3 text-[13px] text-ink"
              >
                Copy transcript
              </button>
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
                  className="pt-px text-[13px] font-semibold"
                  style={{ color: who === "agent" ? "#1E4CC2" : "#16181D" }}
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
