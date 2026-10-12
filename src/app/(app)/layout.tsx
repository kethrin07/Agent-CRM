import { Suspense } from "react";
import Sidebar from "@/components/Sidebar";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen bg-page text-ink">
      <Suspense
        fallback={
          <div className="hidden w-[232px] flex-shrink-0 border-r border-border bg-card shell:block" />
        }
      >
        <Sidebar />
      </Suspense>
      <main className="main flex min-w-0 flex-grow flex-col gap-6 box-border px-4 pb-10 pt-5 shell:px-10 shell:pb-12 shell:pt-7">
        {children}
      </main>
    </div>
  );
}
