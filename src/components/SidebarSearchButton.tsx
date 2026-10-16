"use client";

import { SearchIcon } from "./icons";
import { openCommandPalette } from "./CommandPalette";

export function SidebarSearchButton() {
  return (
    <button
      type="button"
      onClick={openCommandPalette}
      className="flex items-center gap-2.5 rounded-lg border border-border-strong bg-page px-2.5 py-2 text-sm text-muted transition-colors hover:bg-hover"
    >
      <SearchIcon size={16} />
      <span className="flex-grow text-left">Search…</span>
      <kbd className="rounded border border-border-strong px-1.5 py-0.5 font-mono text-[10px]">
        ⌘K
      </kbd>
    </button>
  );
}
