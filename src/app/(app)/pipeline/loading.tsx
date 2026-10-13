import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-40 rounded-md" />
        <Skeleton className="h-4 w-96 max-w-full rounded" />
      </div>

      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card flex flex-col gap-2 px-4 py-3">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-7 w-10 rounded-md" />
          </div>
        ))}
      </div>

      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex w-[280px] flex-shrink-0 flex-col gap-3 rounded-xl border border-border bg-page p-3"
          >
            <Skeleton className="h-4 w-24 rounded" />
            {Array.from({ length: 2 }).map((_, j) => (
              <div key={j} className="card flex flex-col gap-2 p-3">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-3 w-28 rounded" />
                <Skeleton className="h-3 w-full rounded" />
                <Skeleton className="h-6 w-full rounded" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
