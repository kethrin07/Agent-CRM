"use client";

import { HeadphonesIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { useLiveCalls, fmtDuration, type Speaker } from "@/lib/live-calls";
import { agentAccent } from "@/lib/data";

// Broadcast "voice" signal: a centre dot with concentric arcs rippling out
// both sides (radio-wave icon). When active, each arc expands and collapses
// around the centre in a staggered ripple, so it reads as live voice activity.
export function VoiceWaves({
  active,
  color,
  size = 40,
}: {
  active: boolean;
  color: string;
  size?: number;
}) {
  // Arc radii (inner → outer). Kept under 50 so scale(1.08) stays in viewBox.
  const radii = [16, 27, 38];
  const pt = (r: number, deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return [50 + r * Math.cos(rad), 50 + r * Math.sin(rad)];
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
    >
      {radii.map((r, i) => {
        const [sx, sy] = pt(r, -55);
        const [ex, ey] = pt(r, 55);
        const common = {
          stroke: color,
          strokeWidth: 6,
          strokeLinecap: "round" as const,
          style: {
            transformBox: "view-box" as const,
            transformOrigin: "50px 50px",
            opacity: active ? undefined : 0.4,
            animation: active
              ? `voice-wave ${1000 + i * 160}ms ease-in-out ${i * 150}ms infinite`
              : "none",
          },
        };
        return (
          <g key={r}>
            {/* right side ")" */}
            <path d={`M ${sx} ${sy} A ${r} ${r} 0 0 1 ${ex} ${ey}`} {...common} />
            {/* left side "(" (mirrored across x=50) */}
            <path
              d={`M ${100 - sx} ${sy} A ${r} ${r} 0 0 0 ${100 - ex} ${ey}`}
              {...common}
            />
          </g>
        );
      })}
      <circle
        cx="50"
        cy="50"
        r="7"
        fill={color}
        style={{
          transformBox: "view-box",
          transformOrigin: "50px 50px",
          animation: active ? "voice-wave 1000ms ease-in-out infinite" : "none",
        }}
      />
    </svg>
  );
}

export function speakerLabel(speaker: Speaker, agent: string) {
  return speaker === "agent" ? `${agent} speaking` : "Caller speaking";
}

export function LiveCalls() {
  const { calls, openCall } = useLiveCalls();

  if (calls.length === 0) return null;

  return (
    <section className="card flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 flex-shrink-0 animate-pulse rounded-full bg-bad-bar" />
          <h2 className="text-base font-semibold">Live now</h2>
        </div>
        <span className="text-[13px] text-muted">
          {calls.length} call{calls.length === 1 ? "" : "s"} in progress
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {calls.map((c) => {
          const accent = agentAccent[c.agent];
          const agentSpeaking = c.speaker === "agent";
          return (
            <div
              key={c.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3"
            >
              <span className="relative flex-shrink-0">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full font-semibold"
                  style={{ background: accent.bg, color: accent.fg }}
                >
                  {c.agent[0]}
                </span>
                <span className="absolute -right-0.5 -top-0.5 h-3 w-3 animate-pulse rounded-full border-2 border-card bg-bad-bar" />
              </span>

              <div className="flex min-w-0 flex-grow flex-col gap-0.5">
                <div className="flex flex-wrap items-center gap-x-2 text-sm">
                  <span className="font-semibold">{c.agent}</span>
                  <span className="truncate text-xs text-muted">
                    {c.caller.name} · {c.caller.phone}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <VoiceWaves
                    active
                    size={22}
                    color={
                      agentSpeaking
                        ? "var(--color-brand)"
                        : "var(--color-muted)"
                    }
                  />
                  <span>{speakerLabel(c.speaker, c.agent)}</span>
                </div>
              </div>

              <span className="font-mono text-sm tabular-nums text-sub">
                {fmtDuration(c.elapsed)}
              </span>

              <Button size="sm" onClick={() => openCall(c.id)}>
                <HeadphonesIcon size={15} />
                Listen
              </Button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
