import { ConnectionsPanel, Logo, NavLinks } from "./nav";
import { SidebarSearchButton } from "./SidebarSearchButton";
import { AccountPanel } from "./AccountPanel";
import { LiveBadge } from "./LiveBadge";

export default function Sidebar() {
  return (
    <nav
      aria-label="Main"
      className="side sticky top-0 hidden h-screen w-[232px] flex-shrink-0 flex-col gap-1 self-start overflow-y-auto overscroll-contain border-r border-border bg-card px-3.5 py-5 box-border shell:flex"
    >
      <div className="px-2.5 pt-1 pb-[18px]">
        <Logo />
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
