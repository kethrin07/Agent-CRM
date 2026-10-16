"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { CloseIcon } from "@/components/icons";
import { LeadDetailView } from "@/components/LeadDetailView";

type Ctx = { open: (id: string) => void; close: () => void; openId: string | null };

const DrawerContext = createContext<Ctx | null>(null);

export function useLeadDrawer(): Ctx {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error("useLeadDrawer must be used within LeadDrawerProvider");
  return ctx;
}

export function LeadDrawerProvider({ children }: { children: React.ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null);

  const open = useCallback((id: string) => setOpenId(id), []);
  const close = useCallback(() => setOpenId(null), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  useEffect(() => {
    document.body.style.overflow = openId ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [openId]);

  return (
    <DrawerContext.Provider value={{ open, close, openId }}>
      {children}

      {openId && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-ink/40 animate-[fade-in_150ms_ease-out]"
            onClick={close}
          />
          <aside
            aria-label="Lead detail"
            className="absolute inset-y-0 right-0 flex w-full max-w-[560px] flex-col overflow-y-auto bg-page shadow-xl animate-[drawer-in-right_220ms_ease-out]"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-page/90 px-5 py-3 backdrop-blur">
              <span className="text-sm font-semibold text-muted">
                Lead detail
              </span>
              <div className="flex items-center gap-1.5">
                <Link
                  href={`/leads/${openId}`}
                  onClick={close}
                  className="rounded-md px-2 py-1 text-[13px] font-medium"
                >
                  Open full page
                </Link>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={close}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-hover hover:text-ink"
                >
                  <CloseIcon size={18} />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-5 p-5">
              <LeadDetailView id={openId} variant="drawer" />
            </div>
          </aside>
        </div>
      )}
    </DrawerContext.Provider>
  );
}
