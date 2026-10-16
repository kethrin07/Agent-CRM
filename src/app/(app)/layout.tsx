import { Suspense } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { LeadsStoreProvider } from "@/lib/leads-store";
import { LeadDrawerProvider } from "@/components/LeadDrawer";
import { CommandPalette } from "@/components/CommandPalette";
import { ToastProvider } from "@/components/ui/Toast";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ToastProvider>
      <LeadsStoreProvider>
        <LeadDrawerProvider>
        <CommandPalette />
        <div className="flex min-h-screen bg-page text-ink">
        <Suspense
          fallback={
            <div className="sticky top-0 hidden h-screen w-[232px] flex-shrink-0 self-start border-r border-border bg-card shell:block" />
          }
        >
          <Sidebar />
        </Suspense>
        <div className="flex min-w-0 flex-grow flex-col">
          <TopBar />
          <main className="main flex min-w-0 flex-grow flex-col gap-6 box-border px-4 pb-10 pt-6 shell:px-10 shell:pb-12 shell:pt-7">
            {children}
          </main>
          </div>
        </div>
        </LeadDrawerProvider>
      </LeadsStoreProvider>
    </ToastProvider>
  );
}
