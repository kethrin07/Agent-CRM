"use client";

import { useRouter } from "next/navigation";
import { useLiveCalls } from "@/lib/live-calls";

export function LiveIndicator({ compact = false }: { compact?: boolean }) {
  const { calls } = useLiveCalls();
  const router = useRouter();

  if (calls.length === 0) return null;
  const go = () => router.push("/");

  if (compact) {
    return (
      <button
        type="button"
        aria-label={`${calls.length} live calls`}
        onClick={go}
        className="flex h-10 items-center gap-1.5 rounded-lg border border-border-strong bg-card px-2.5 text-ink transition-colors hover:bg-hover"
      >
        <span className="h-2 w-2 animate-pulse rounded-full bg-bad-bar" />
        <span className="font-mono text-xs font-semibold">{calls.length}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={go}
      className="flex items-center gap-2.5 rounded-lg border border-border-strong bg-card px-2.5 py-2 text-sm text-ink transition-colors hover:bg-hover"
    >
      <span className="h-2 w-2 flex-shrink-0 animate-pulse rounded-full bg-bad-bar" />
      <span className="flex-grow text-left font-medium">Live calls</span>
      <span className="rounded-full bg-bad-bg px-1.5 py-0.5 text-[11px] font-semibold text-bad-fg">
        {calls.length}
      </span>
    </button>
  );
}
