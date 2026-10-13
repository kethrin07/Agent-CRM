"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GridIcon, HomeIcon, KanbanIcon, MicIcon, UsersIcon } from "./icons";
import { connections } from "@/lib/data";

export const navItems = [
  { href: "/", label: "Overview", Icon: GridIcon },
  { href: "/leads", label: "Leads & calls", Icon: UsersIcon },
  { href: "/pipeline", label: "Pipeline", Icon: KanbanIcon },
  { href: "/agent", label: "Agent settings", Icon: MicIcon },
] as const;

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-white">
        <HomeIcon />
      </div>
      <div className="text-base font-bold tracking-[-0.01em]">MyHomeQuote</div>
    </div>
  );
}

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {navItems.map(({ href, label, Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-2.5 rounded-lg p-3 text-sm no-underline transition-colors ${
              active
                ? "bg-brand-soft font-semibold text-brand hover:text-brand"
                : "text-sub hover:bg-page hover:text-sub"
            }`}
          >
            <Icon />
            {label}
          </Link>
        );
      })}
    </>
  );
}

export function ConnectionsPanel() {
  return (
    <div className="flex flex-col gap-2 rounded-[10px] border border-border p-3 text-xs text-muted2">
      <div className="text-xs font-semibold text-ink">Connections</div>
      {connections.map((c) => (
        <div key={c} className="flex items-center gap-2">
          <span className="h-2 w-2 flex-shrink-0 rounded-full bg-good" />
          {c}
        </div>
      ))}
    </div>
  );
}
