"use client";

import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "@/components/icons";
import { navItems } from "@/components/nav";
import { useLeadDrawer } from "@/components/LeadDrawer";
import { useLeads } from "@/lib/leads-store";
import { useRole } from "@/lib/role";

/** Trigger the palette from anywhere (e.g. a toolbar button). */
export function openCommandPalette() {
  window.dispatchEvent(new CustomEvent("cmdk:open"));
}

type Result = {
  kind: "page" | "lead";
  key: string;
  label: string;
  sub: string;
  Icon?: ComponentType<{ size?: number }>;
  initial?: string;
  run: () => void;
};

export function CommandPalette() {
  const router = useRouter();
  const { leads } = useLeads();
  const { open: openLead } = useLeadDrawer();
  const { role } = useRole();
  const isAdmin = role === "admin";

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Open on ⌘K / Ctrl+K, or a custom event from toolbar buttons.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("cmdk:open", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("cmdk:open", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
      document.body.style.overflow = "hidden";
      // focus after paint
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();

    const pages: Result[] = navItems
      .filter((p) => !p.adminOnly || isAdmin)
      .filter((p) => !q || p.label.toLowerCase().includes(q))
      .map((p) => ({
        kind: "page",
        key: p.href,
        label: p.label,
        sub: "Page",
        Icon: p.Icon,
        run: () => {
          setOpen(false);
          router.push(p.href);
        },
      }));

    const leadResults: Result[] = leads
      .filter(
        (l) =>
          !q ||
          l.name.toLowerCase().includes(q) ||
          l.phone.toLowerCase().includes(q) ||
          l.intent.toLowerCase().includes(q),
      )
      .slice(0, q ? 8 : 5)
      .map((l) => ({
        kind: "lead",
        key: l.id,
        label: l.name,
        sub: l.phone,
        initial: l.name[0]?.toUpperCase() ?? "?",
        run: () => {
          setOpen(false);
          openLead(l.id);
        },
      }));

    return [...pages, ...leadResults];
  }, [query, leads, router, openLead, isAdmin]);

  // Keep selection in range as results change.
  useEffect(() => {
    setSelected((s) => Math.min(s, Math.max(0, results.length - 1)));
  }, [results.length]);

  if (!open) return null;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(results.length - 1, s + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(0, s - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      results[selected]?.run();
    }
  };

  let lastKind: string | null = null;

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center p-4 pt-[12vh]">
      <div
        className="absolute inset-0 bg-ink/40 animate-[fade-in_120ms_ease-out]"
        onClick={() => setOpen(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onKeyDown={onKeyDown}
        className="card relative flex w-full max-w-lg flex-col overflow-hidden shadow-xl"
      >
        <div className="flex items-center gap-2.5 border-b border-hairline px-4 py-3 text-muted">
          <SearchIcon />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search leads and pages…"
            className="min-w-0 flex-grow bg-transparent text-sm text-ink outline-none"
          />
          <kbd className="rounded border border-border-strong px-1.5 py-0.5 font-mono text-[10px] text-muted">
            esc
          </kbd>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-1.5">
          {results.length === 0 && (
            <div className="px-3 py-8 text-center text-sm text-muted">
              No matches
            </div>
          )}
          {results.map((r, i) => {
            const header =
              r.kind !== lastKind ? (r.kind === "page" ? "Pages" : "Leads") : null;
            lastKind = r.kind;
            return (
              <div key={`${r.kind}-${r.key}`}>
                {header && (
                  <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-muted">
                    {header}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => r.run()}
                  onMouseEnter={() => setSelected(i)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    i === selected ? "bg-hover" : ""
                  }`}
                >
                  {r.kind === "page" && r.Icon ? (
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-brand-soft text-brand">
                      <r.Icon size={16} />
                    </span>
                  ) : (
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-nora-bg text-[11px] font-semibold text-nora-fg">
                      {r.initial}
                    </span>
                  )}
                  <span className="flex min-w-0 flex-grow flex-col">
                    <span className="truncate font-medium text-ink">{r.label}</span>
                    <span className="truncate text-xs text-muted">{r.sub}</span>
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-3 border-t border-hairline px-4 py-2 text-[11px] text-muted">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}
