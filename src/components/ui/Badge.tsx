import type { CSSProperties, ReactNode } from "react";
import { stageMeta, statusStyle, type Stage, type Status } from "@/lib/data";

export function Badge({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}

export function StatusBadge({
  status,
  label,
}: {
  status: Status;
  label?: string;
}) {
  const s = statusStyle[status];
  return (
    <Badge style={{ background: s.bg, color: s.fg }}>{label ?? status}</Badge>
  );
}

export function StageBadge({ stage }: { stage: Stage }) {
  const s = stageMeta[stage];
  return (
    <Badge className="gap-1.5" style={{ background: s.bg, color: s.fg }}>
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: s.dot }}
      />
      {s.label}
    </Badge>
  );
}
