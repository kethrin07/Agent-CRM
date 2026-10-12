"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GridIcon, HomeIcon, MicIcon, UsersIcon } from "./icons";
import { connections } from "@/lib/data";

const nav = [
  { href: "/", label: "Overview", Icon: GridIcon },
  { href: "/leads", label: "Leads & calls", Icon: UsersIcon },
  { href: "/agent", label: "Agent settings", Icon: MicIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      aria-label="Main"
      className="side hidden shell:flex w-[232px] flex-shrink-0 flex-col gap-1 border-r border-border bg-card px-3.5 py-5 box-border"
    >
      <div className="flex items-center gap-2.5 px-2.5 pt-1 pb-[22px]">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-white">
          <HomeIcon />
        </div>
        <div className="text-base font-bold tracking-[-0.01em]">MyHomeQuote</div>
      </div>

      {nav.map(({ href, label, Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2.5 rounded-lg p-3 text-sm no-underline ${
              active
                ? "bg-brand-soft font-semibold text-brand"
                : "text-sub hover:bg-page"
            }`}
          >
            <Icon />
            {label}
          </Link>
        );
      })}

      <div className="flex-grow" />

      <div className="flex flex-col gap-2 rounded-[10px] border border-border p-3 text-xs text-muted2">
        <div className="text-xs font-semibold text-ink">Connections</div>
        {connections.map((c) => (
          <div key={c} className="flex items-center gap-2">
            <span className="h-2 w-2 flex-shrink-0 rounded-full bg-good" />
            {c}
          </div>
        ))}
      </div>
    </nav>
  );
}
