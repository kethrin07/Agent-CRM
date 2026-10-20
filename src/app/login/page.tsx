"use client";

import { useRouter } from "next/navigation";
import { Logo } from "@/components/nav";
import { GridIcon, UsersIcon } from "@/components/icons";
import { useRole, type Role } from "@/lib/role";

export default function LoginPage() {
  const router = useRouter();
  const { setRole } = useRole();

  const choose = (role: Role) => {
    setRole(role);
    router.push("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-page p-6 text-ink">
      <div className="card flex w-full max-w-sm flex-col gap-6 p-7">
        <div className="flex flex-col items-center gap-3 text-center">
          <Logo />
          <div className="flex flex-col gap-1">
            <h1 className="text-lg font-semibold">Welcome back</h1>
            <p className="text-sm text-muted">
              Demo access — choose how you’d like to sign in.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => choose("admin")}
            className="flex items-center gap-3 rounded-xl border border-border-strong bg-card p-4 text-left transition-colors hover:bg-hover"
          >
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
              <GridIcon />
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold">Continue as Admin</span>
              <span className="text-xs text-muted">
                You and your team — full access
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => choose("client")}
            className="flex items-center gap-3 rounded-xl border border-border-strong bg-card p-4 text-left transition-colors hover:bg-hover"
          >
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
              <UsersIcon />
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold">Continue as Client</span>
              <span className="text-xs text-muted">
                Leads &amp; dashboard — limited view
              </span>
            </span>
          </button>
        </div>

        <p className="text-center text-xs text-muted2">
          Roles are for preview only and aren’t enforced yet.
        </p>
      </div>
    </div>
  );
}
