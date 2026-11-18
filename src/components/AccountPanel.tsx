"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/lib/role";
import { clientName } from "@/lib/data";

export function AccountPanel({
  compact = false,
  onClick,
}: {
  compact?: boolean;
  // When provided (compact mode), the avatar runs this instead of signing out
  // — e.g. expand the sidebar. Avoids accidental logouts from the narrow rail.
  onClick?: () => void;
}) {
  const { role, clientId, logout } = useRole();
  const router = useRouter();

  // Server HTML has no role (no localStorage). Render blank until mounted so the
  // first client render matches the server, then the local state flip forces a
  // re-render that fills in the real role — no flash, and it never gets stuck.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const signOut = () => {
    logout();
    router.replace("/login");
  };

  const label = !mounted
    ? ""
    : role === "admin"
      ? "Admin"
      : role === "client"
        ? clientId
          ? clientName(clientId)
          : "Client"
        : "";

  // Collapsed-rail avatar: a round button showing the role's initial. Runs the
  // provided action (e.g. expand the sidebar) if given, else signs out. The
  // tooltip/aria-label spell out who's signed in, since there's no text.
  if (compact) {
    const expands = Boolean(onClick);
    return (
      <button
        type="button"
        onClick={onClick ?? signOut}
        aria-label={
          expands
            ? label
              ? `${label} — expand sidebar`
              : "Expand sidebar"
            : label
              ? `Sign out (${label})`
              : "Sign out"
        }
        title={
          expands
            ? label
              ? `Signed in as ${label} — expand sidebar`
              : "Expand sidebar"
            : label
              ? `${label} — Sign out`
              : "Sign out"
        }
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-xs font-semibold text-ink transition-colors hover:bg-hover"
      >
        {label ? label[0] : ""}
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2 rounded-[10px] border border-border p-3 text-xs">
      <div className="flex flex-col gap-0.5">
        <span className="text-muted">Signed in as</span>
        <span className="font-semibold text-ink">{label || " "}</span>
      </div>
      <button
        type="button"
        onClick={signOut}
        className="rounded-md border border-border-strong bg-card px-2.5 py-1.5 font-medium text-ink transition-colors hover:bg-hover"
      >
        Sign out
      </button>
    </div>
  );
}
