"use client";

import { useEffect, useState } from "react";
import { CloseIcon, MenuIcon } from "./icons";
import { ConnectionsPanel, Logo, NavLinks } from "./nav";

export default function MobileTopBar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/90 px-4 py-3 backdrop-blur shell:hidden">
        <Logo />
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-strong bg-card text-ink transition-colors hover:bg-hover"
        >
          <MenuIcon />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 shell:hidden">
          <div
            className="absolute inset-0 bg-ink/40 animate-[fade-in_150ms_ease-out]"
            onClick={() => setOpen(false)}
          />
          <nav
            aria-label="Main"
            className="absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col gap-1 border-r border-border bg-card px-3.5 py-5 shadow-xl animate-[drawer-in_200ms_ease-out]"
          >
            <div className="flex items-center justify-between px-2.5 pt-1 pb-[22px]">
              <Logo />
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-hover hover:text-ink"
              >
                <CloseIcon />
              </button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
            <div className="flex-grow" />
            <ConnectionsPanel />
          </nav>
        </div>
      )}
    </>
  );
}
