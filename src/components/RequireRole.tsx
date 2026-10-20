"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/lib/role";

export function RequireRole({ children }: { children: React.ReactNode }) {
  const { role, hydrated } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !role) router.replace("/login");
  }, [hydrated, role, router]);

  const blocked = !hydrated || !role;

  // Always render children (so the route segment isn't dropped from
  // rendering), but cover them with an opaque screen until the role is
  // confirmed — avoids flashing the app before redirecting to /login.
  return (
    <>
      {children}
      {blocked && (
        <div aria-hidden="true" className="fixed inset-0 z-[200] bg-page" />
      )}
    </>
  );
}
