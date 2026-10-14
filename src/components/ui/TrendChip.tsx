import { TrendIcon } from "@/components/icons";

export type Tone = "pos" | "neg" | "neutral";
export type Trend = { dir: "up" | "down"; label: string; tone: Tone };

const toneClass: Record<Tone, string> = {
  pos: "bg-good-bg text-good-fg",
  neg: "bg-bad-bg text-bad-fg",
  neutral: "bg-row text-muted2",
};

export const sparkColor: Record<Tone, string> = {
  pos: "var(--color-good)",
  neg: "var(--color-bad-bar)",
  neutral: "var(--color-neutral-dot)",
};

export function TrendChip({ trend }: { trend: Trend }) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${toneClass[trend.tone]}`}
    >
      <TrendIcon dir={trend.dir} size={12} />
      {trend.label}
    </span>
  );
}
