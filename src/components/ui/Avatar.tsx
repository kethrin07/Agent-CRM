import type { TeamMember } from "@/lib/data";

export function Avatar({
  member,
  size = 24,
}: {
  member: TeamMember | null;
  size?: number;
}) {
  const style = { width: size, height: size, fontSize: size * 0.42 };

  if (!member) {
    return (
      <span
        aria-label="Unassigned"
        className="flex flex-shrink-0 items-center justify-center rounded-full border border-dashed border-dash text-muted"
        style={style}
      >
        ?
      </span>
    );
  }

  return (
    <span
      aria-label={member.name}
      title={member.name}
      className="flex flex-shrink-0 items-center justify-center rounded-full font-semibold"
      style={{ ...style, background: member.bg, color: member.fg }}
    >
      {member.initial}
    </span>
  );
}
