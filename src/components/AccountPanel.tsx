"use client";

import { useRouter } from "next/navigation";
import { useRole } from "@/lib/role";

export function AccountPanel() {
  const { role, logout } = useRole();
  const router = useRouter();

  const signOut = () => {
    logout();
    router.replace("/login");
  };

  const label = role === "admin" ? "Admin" : "Client";

  return (
    <div className="flex items-center justify-between gap-2 rounded-[10px] border border-border p-3 text-xs">
      <div className="flex flex-col gap-0.5">
        <span className="text-muted">Signed in as</span>
        {/* Role comes from localStorage, so this text is client-specific. */}
        <span suppressHydrationWarning className="font-semibold text-ink">
          {label}
        </span>
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
