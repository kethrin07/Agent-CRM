import type { CSSProperties, ReactNode } from "react";
import { statusStyle, type Status } from "@/lib/data";

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
