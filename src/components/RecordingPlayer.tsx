"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type RefObject,
} from "react";
import { PlayIcon } from "@/components/icons";
import { waveform } from "@/lib/data";

function fmt(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Cycled by the speed button, in order.
const SPEEDS = [1, 1.5, 2, 0.25, 0.1];

/**
 * Call recording player. With a `src` it plays the real audio via an <audio>
 * element (play/pause, live time, click-to-seek). Without a `src` it falls back
 * to the simulated demo behavior (progressing time + waveform fill).
 */
export function RecordingPlayer({
  src,
  total = 78,
  onTime,
  seekRef,
}: {
  src?: string;
  total?: number;
  onTime?: (t: number) => void;
  seekRef?: RefObject<((t: number) => void) | null>;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(src ? 0 : 22);
  const [duration, setDuration] = useState(total);
  const [error, setError] = useState(false);
  const [rateIdx, setRateIdx] = useState(0);
  const rate = SPEEDS[rateIdx];
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Apply playback speed to the real audio element.
  useEffect(() => {
    if (src && audioRef.current) audioRef.current.playbackRate = rate;
  }, [rate, src]);

  // Report playback time upward (so the transcript can highlight the current line).
  useEffect(() => {
    onTime?.(elapsed);
  }, [elapsed, onTime]);

  // Expose a seek function so clicking a transcript line jumps the audio.
  useEffect(() => {
    if (!seekRef) return;
    seekRef.current = (t: number) => {
      if (src) {
        const a = audioRef.current;
        if (a) {
          a.currentTime = t;
          a.play().catch(() => {});
        }
      } else {
        setElapsed(Math.min(t, duration));
        setPlaying(true);
      }
    };
    return () => {
      seekRef.current = null;
    };
  }, [seekRef, src, duration]);

  // Simulated progression only when there's no real audio.
  useEffect(() => {
    if (src || !playing) return;
    timer.current = setInterval(() => {
      setElapsed((e) => {
        if (e + rate >= duration) {
          setPlaying(false);
          return duration;
        }
        return e + rate;
      });
    }, 1000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing, duration, src, rate]);

  const toggle = () => {
    if (src) {
      const a = audioRef.current;
      if (!a) return;
      if (a.paused) a.play().catch(() => setError(true));
      else a.pause();
    } else {
      if (!playing && elapsed >= duration) setElapsed(0); // restart when finished
      setPlaying((p) => !p);
    }
  };

  const seek = (e: MouseEvent<HTMLDivElement>) => {
    if (!src || !duration) return;
    const a = audioRef.current;
    if (!a) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    a.currentTime = ratio * duration;
  };

  const progress = duration ? elapsed / duration : 0;
  const filledBars = Math.round(progress * waveform.length);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-3.5">
        <button
          type="button"
          aria-label={playing ? "Pause recording" : "Play recording"}
          aria-pressed={playing}
          onClick={toggle}
          disabled={error}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
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

        <div
          onClick={seek}
          className="flex h-10 min-w-0 flex-grow items-center gap-0.5 overflow-hidden"
          style={{ cursor: src ? "pointer" : "default" }}
        >
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
          {fmt(elapsed)} / {fmt(duration)}
        </span>

        <button
          type="button"
          onClick={() => setRateIdx((i) => (i + 1) % SPEEDS.length)}
          aria-label={`Playback speed ${rate}x`}
          className="flex-shrink-0 rounded-md border border-border-strong bg-card px-2 py-1 font-mono text-xs text-ink tabular-nums transition-colors hover:bg-hover"
        >
          {rate}x
        </button>
      </div>

      {error && (
        <span className="text-xs text-muted">Recording unavailable.</span>
      )}

      {src && (
        <audio
          ref={audioRef}
          src={src}
          preload="metadata"
          className="hidden"
          onLoadedMetadata={(e) => {
            const d = e.currentTarget.duration;
            if (Number.isFinite(d) && d > 0) setDuration(Math.round(d));
          }}
          onTimeUpdate={(e) => setElapsed(e.currentTarget.currentTime)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}
