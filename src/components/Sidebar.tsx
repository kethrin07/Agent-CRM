import { ConnectionsPanel, Logo, NavLinks } from "./nav";

export default function Sidebar() {
  return (
    <nav
      aria-label="Main"
      className="side hidden w-[232px] flex-shrink-0 flex-col gap-1 border-r border-border bg-card px-3.5 py-5 box-border shell:flex"
    >
      <div className="px-2.5 pt-1 pb-[22px]">
        <Logo />
      </div>
      <NavLinks />
      <div className="flex-grow" />
      <ConnectionsPanel />
    </nav>
  );
}
