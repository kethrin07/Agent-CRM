"use client";

import { ConnectionsPanel, Logo, NavLinks } from "./nav";
import { SidebarSearchButton } from "./SidebarSearchButton";
import { AccountPanel } from "./AccountPanel";
import { LiveBadge } from "./LiveBadge";
import { openCommandPalette } from "./CommandPalette";
import { ChevronLeftIcon, ChevronRightIcon, SearchIcon } from "./icons";
import { useSidebar } from "@/lib/sidebar";

export default function Sidebar() {
  const { collapsed, mounted, toggle } = useSidebar();
  // Expanded on the server and first client render (mounted === false), so SSR
  // and hydration match; the stored "collapsed" preference applies after mount.
  const isCollapsed = mounted && collapsed;

  // Collapsed: a slim icon rail in the layout flow (no overlap with page
  // content). Keeps navigation reachable — nav icons + search — plus an expand
  // button. Frees ~170px of width for the main area.
  if (isCollapsed) {
    return (
      <nav
        aria-label="Main"
        className="side sticky top-0 hidden h-screen w-[60px] flex-shrink-0 flex-col items-center gap-1 self-start overflow-y-auto overscroll-contain border-r border-border bg-card px-2 py-5 box-border shell:flex"
      >
        <button
          type="button"
          aria-label="Expand sidebar"
          aria-expanded={false}
          onClick={toggle}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-muted transition-colors hover:bg-hover hover:text-ink"
        >
          <ChevronRightIcon />
        </button>
        <div className="h-1.5" />
        <NavLinks iconOnly />
        <button
          type="button"
          aria-label="Search"
          title="Search"
          onClick={openCommandPalette}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-sub transition-colors hover:bg-page"
        >
          <SearchIcon size={18} />
        </button>
        <div className="flex-grow" />
        <LiveBadge compact />
        <AccountPanel compact onClick={toggle} />
      </nav>
    );
  }

  return (
    <nav
      aria-label="Main"
      className="side sticky top-0 hidden h-screen w-[232px] flex-shrink-0 flex-col gap-1 self-start overflow-y-auto overscroll-contain border-r border-border bg-card px-3.5 py-5 box-border shell:flex"
    >
      <div className="flex items-center justify-between px-2.5 pt-1 pb-[18px]">
        <Logo />
        <button
          type="button"
          aria-label="Collapse sidebar"
          aria-expanded={true}
          onClick={toggle}
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-hover hover:text-ink"
        >
          <ChevronLeftIcon />
        </button>
      </div>
      <SidebarSearchButton />
      <div className="h-1.5" />
      <NavLinks />
      <div className="flex-grow" />
      <LiveBadge />
      <AccountPanel />
      <ConnectionsPanel />
    </nav>
  );
}
