"use client";

import { useEffect, useRef, useState } from "react";
import { CloseIcon, HeadphonesIcon } from "@/components/icons";
import { VoiceWaves } from "@/components/LiveCalls";
import { useLiveCalls, fmtDuration, type LiveCall } from "@/lib/live-calls";
import { agentAccent } from "@/lib/data";

export function LiveCallModal() {
  const { calls, openCallId, close } = useLiveCalls();
  const [listening, setListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // The live call for the open id, if it's still active.
  const liveCall = calls.find((c) => c.id === openCallId) ?? null;
  // Retain the last snapshot so that when a call ends (drops out of `calls`)
  // we can show a "Call ended" state with its final transcript instead of the
  // drawer vanishing mid-listen.
  const lastCallRef = useRef<LiveCall | null>(null);
  useEffect(() => {
    if (liveCall) lastCallRef.current = liveCall;
  }, [liveCall]);
  useEffect(() => {
    if (!openCallId) lastCallRef.current = null;
  }, [openCallId]);

  // Render from the live call, or fall back to the retained snapshot once ended.
  const call = liveCall ?? lastCallRef.current;
  const ended = openCallId != null && liveCall == null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  useEffect(() => {
    document.body.style.overflow = openCallId ? "hidden" : "";
    if (!openCallId) setListening(false);
    return () => {
      document.body.style.overflow = "";
    };
  }, [openCallId]);

  const lineCount = call?.lines.length ?? 0;
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lineCount]);

  if (!call) return null;
  const accent = agentAccent[call.agent];
  const agentSpeaking = call.speaker === "agent";
  const speakerColor = ended
    ? "var(--color-muted)"
    : agentSpeaking
      ? "var(--color-brand)"
      : "var(--color-sub)";
  // No live audio to listen to once the call has ended.
  const audioActive = listening && !ended;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-ink/40 animate-[fade-in_150ms_ease-out]"
        onClick={close}
      />
      <aside
        aria-label="Live call"
        className="absolute inset-y-0 right-0 flex w-full max-w-[520px] flex-col bg-page shadow-xl animate-[drawer-in-right_220ms_ease-out]"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-border bg-page/90 px-5 py-3 backdrop-blur">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted">
            <span
              className={`h-2 w-2 rounded-full ${
                ended ? "bg-dash" : "animate-pulse bg-bad-bar"
              }`}
            />
            {ended ? "Call ended" : "Live call"}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-hover hover:text-ink"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-grow flex-col gap-5 p-5">
          {/* Identity */}
          <div className="flex items-center gap-3">
            <span className="relative flex-shrink-0">
              <span
                className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold"
                style={{ background: accent.bg, color: accent.fg }}
              >
                {call.agent[0]}
              </span>
              {!ended && (
                <span className="absolute -right-0.5 -top-0.5 h-3 w-3 animate-pulse rounded-full border-2 border-page bg-bad-bar" />
              )}
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="font-semibold">
                {call.agent} · {call.agentRole}
              </span>
              <span className="truncate text-[13px] text-muted">
                {call.caller.name} · {call.caller.phone}
              </span>
            </div>
            <span className="ml-auto font-mono text-sm tabular-nums text-sub">
              {fmtDuration(call.elapsed)}
            </span>
          </div>

          {/* Speaker panel */}
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card py-7">
            {/* Ripples only while actually listening to a live call */}
            <VoiceWaves active={audioActive} size={88} color={speakerColor} />
            <div
              className={`text-sm font-medium ${ended ? "text-muted" : ""}`}
            >
              {ended
                ? "This call has ended"
                : agentSpeaking
                  ? `${call.agent} is speaking…`
                  : "Caller is speaking…"}
            </div>
          </div>

          {/* Listen */}
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              disabled={ended}
              aria-pressed={audioActive}
              onClick={() => setListening((l) => !l)}
              className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                ended
                  ? "cursor-not-allowed border-border bg-card text-muted opacity-60"
                  : audioActive
                    ? "border-brand bg-brand-soft text-brand"
                    : "border-border-strong bg-card text-ink hover:bg-hover"
              }`}
            >
              <HeadphonesIcon size={16} />
              {ended
                ? "Call ended"
                : audioActive
                  ? "Listening to live audio…"
                  : "Listen live"}
            </button>
            {audioActive && (
              <p className="text-center text-xs text-muted2">
                Live audio is simulated in this preview.
              </p>
            )}
            {ended && (
              <p className="text-center text-xs text-muted2">
                The transcript below is the final record of this call.
              </p>
            )}
          </div>

          {/* Live transcript */}
          <div className="flex min-h-0 flex-grow flex-col gap-1.5">
            <div className="text-[13px] font-semibold">
              {ended ? "Transcript" : "Live transcript"}
            </div>
            <div
              ref={scrollRef}
              className="flex min-h-0 flex-grow flex-col gap-2 overflow-y-auto rounded-xl border border-border bg-card p-4"
            >
              {call.lines.map((l, i) => (
                <div
                  key={i}
                  className="grid gap-3 text-sm leading-relaxed [grid-template-columns:44px_minmax(0,1fr)]"
                >
                  <span className="pt-0.5 font-mono text-xs text-muted">
                    {l.t}
                  </span>
                  <span className="text-ink2">
                    <span
                      className={`mr-1.5 text-[13px] font-semibold ${
                        l.who === "agent" ? "text-brand" : "text-ink"
                      }`}
                    >
                      {l.who === "agent" ? call.agent : "Caller"}:
                    </span>
                    {l.text}
                    {!ended && i === call.lines.length - 1 && (
                      <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-muted align-middle" />
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
