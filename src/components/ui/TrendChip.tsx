import { TrendIcon } from "@/components/icons";

export type Tone = "pos" | "neg" | "neutral";
export type Trend = { dir: "up" | "down"; label: string; tone: Tone };

const toneClass: Record<Tone, string> = {
  pos: "bg-good-bg text-good-fg",
  neg: "bg-bad-bg text-bad-fg",
  neutral: "bg-row text-muted2",
};

export const sparkColor: Record<Tone, string> = {
  pos: "#1E8A4C",
  neg: "#C0332B",
  neutral: "#8A8F9C",
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
