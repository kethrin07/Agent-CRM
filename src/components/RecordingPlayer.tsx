"use client";

import { useEffect, useRef, useState } from "react";
import { PlayIcon } from "@/components/icons";
import { waveform } from "@/lib/data";

function fmt(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Simulated call recording player — real play/pause + progressing time and
 * waveform fill. (No real audio file yet; swap in an <audio> element once the
 * ElevenLabs recording URL is wired.)
 */
export function RecordingPlayer({ total = 78 }: { total?: number }) {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(22);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => {
      setElapsed((e) => {
        if (e + 1 >= total) {
          setPlaying(false);
          return total;
        }
        return e + 1;
      });
    }, 1000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing, total]);

  const toggle = () => {
    if (!playing && elapsed >= total) setElapsed(0); // restart when finished
    setPlaying((p) => !p);
  };

  const progress = elapsed / total;
  const filledBars = Math.round(progress * waveform.length);

  return (
    <div className="flex items-center gap-3.5">
      <button
        type="button"
        aria-label={playing ? "Pause recording" : "Play recording"}
        aria-pressed={playing}
        onClick={toggle}
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand text-white transition-colors hover:bg-brand-hover"
      >
        {playing ? (
          <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <PlayIcon />
        )}
      </button>

      <div className="flex h-10 min-w-0 flex-grow items-center gap-0.5 overflow-hidden">
        {waveform.map((w, i) => (
          <div
            key={i}
            className="min-w-0.5 flex-grow basis-0 rounded-sm transition-colors"
            style={{
              height: w.h,
              background:
                i < filledBars
                  ? "var(--color-brand)"
                  : "var(--color-brand-bar-soft)",
            }}
          />
        ))}
      </div>

      <span className="flex-shrink-0 font-mono text-xs text-muted tabular-nums">
        {fmt(elapsed)} / {fmt(total)}
      </span>
    </div>
  );
}
