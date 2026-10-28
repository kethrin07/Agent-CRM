"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GridIcon, MicIcon, UsersIcon } from "./icons";
import { connections } from "@/lib/data";
import { useRole } from "@/lib/role";

export const navItems = [
  { href: "/", label: "Dashboard", Icon: GridIcon, adminOnly: false },
  { href: "/leads", label: "Leads & calls", Icon: UsersIcon, adminOnly: false },
  { href: "/agents", label: "Agent performance", Icon: MicIcon, adminOnly: true },
] as const;

/** Compact Ø monogram — kept for splash/login use. */
export function Mark({
  strokeWidth,
  gradientId,
  className,
}: {
  strokeWidth: number;
  gradientId: string;
  className: string;
}) {
  return (
    <svg
      viewBox="-20 -26 160 174"
      role="img"
      aria-label="Milvado 55"
      className={className}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          x1="-20"
          y1="-40"
          x2="220"
          y2="150"
        >
          <stop offset="0" stopColor="#D9A566" />
          <stop offset=".4" stopColor="#F3D6A4" />
          <stop offset=".6" stopColor="#A66A2C" />
          <stop offset=".85" stopColor="#6E4218" />
          <stop offset="1" stopColor="#C58E4F" />
        </linearGradient>
      </defs>
      <g style={{ stroke: "var(--color-ink)" }} strokeWidth={strokeWidth} data-part="o">
        <path d="M73,1.43 A60,60 0 0 1 73,118.57" />
        <path d="M47,1.43 A60,60 0 0 0 47,118.57" />
      </g>
      <g data-part="accent">
        <g className="twin" data-twin="dark" stroke="#9B1B30">
          <path d="M60,-20 V142" strokeWidth={strokeWidth} />
        </g>
        <g className="twin" data-twin="light" stroke={`url(#${gradientId})`}>
          <path d="M60,-20 V142" strokeWidth={strokeWidth} />
        </g>
      </g>
    </svg>
  );
}

const wordmarkAccent = (
  <>
    <path d="M1087,-20 V142" />
    <path d="M1201,0 H1263" />
    <path d="M1201,18 V52 H1231 A34,34 0 0 1 1231,120 H1203" />
    <path d="M1297,0 H1359" />
    <path d="M1297,18 V52 H1327 A34,34 0 0 1 1327,120 H1299" />
  </>
);

/** Full MILVADO 55 wordmark. Accent "55" is gold (light) / red (dark). */
export function Logo() {
  const gid = "mg-" + useId().replace(/:/g, "");
  return (
    <svg
      viewBox="-8 -26 1375 176"
      role="img"
      aria-label="Milvado 55"
      className="h-[15px] w-auto md:h-[18px]"
      fill="none"
      strokeWidth={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <linearGradient
          id={gid}
          gradientUnits="userSpaceOnUse"
          x1="900"
          y1="-30"
          x2="1400"
          y2="150"
        >
          <stop offset="0" stopColor="#D9A566" />
          <stop offset=".4" stopColor="#F3D6A4" />
          <stop offset=".6" stopColor="#A66A2C" />
          <stop offset=".85" stopColor="#6E4218" />
          <stop offset="1" stopColor="#C58E4F" />
        </linearGradient>
      </defs>
      <g style={{ stroke: "var(--color-ink)" }} data-part="letters">
        <path d="M0,120 L75,0 L132,95 L192,0 L262,120" />
        <path d="M310,0 V120" />
        <path d="M391,0 V120" />
        <path d="M416,120 H476" />
        <path d="M503,0 L566,120 L631,0" />
        <path d="M674,120 L739,0 L801,120" />
        <path d="M862,0 V120" />
        <path d="M902,0 H919 A60,60 0 0 1 919,120 H902" />
      </g>
      <g style={{ stroke: "var(--color-ink)" }} data-part="o">
        <path d="M1100,1.43 A60,60 0 0 1 1100,118.57" />
        <path d="M1074,1.43 A60,60 0 0 0 1074,118.57" />
      </g>
      <g data-part="accent">
        <g className="twin" data-twin="dark" stroke="#9B1B30">
          {wordmarkAccent}
        </g>
        <g className="twin" data-twin="light" stroke={`url(#${gid})`}>
          {wordmarkAccent}
        </g>
      </g>
    </svg>
  );
}

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { role } = useRole();
  // Local mounted flag (not the shared RoleProvider one): guaranteed false
  // during this component's own hydration render, so server + first client
  // render always match even though the provider resolves role earlier.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const showAdmin = mounted && role === "admin";
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {navItems
        .filter((i) => !i.adminOnly || showAdmin)
        .map(({ href, label, Icon }) => {
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
  const { role } = useRole();
  // Local mounted flag so server + first client render match (admin-only).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || role !== "admin") return null;

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
