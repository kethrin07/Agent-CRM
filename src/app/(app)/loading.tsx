import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-40 rounded-md" />
          <Skeleton className="h-4 w-72 rounded" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(210px,1fr))]">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card flex flex-col gap-3 px-5 py-[18px]">
            <Skeleton className="h-3.5 w-24 rounded" />
            <div className="flex items-end justify-between gap-3">
              <Skeleton className="h-8 w-20 rounded-md" />
              <Skeleton className="h-8 w-[88px] rounded-md" />
            </div>
            <Skeleton className="h-3 w-28 rounded" />
          </div>
        ))}
      </div>

      {/* Chart + quality */}
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(340px,1fr))]">
        <div className="card flex flex-col gap-4 p-5">
          <Skeleton className="h-5 w-28 rounded" />
          <Skeleton className="h-[180px] w-full rounded-lg" />
        </div>
        <div className="card flex flex-col gap-4 p-5">
          <Skeleton className="h-5 w-28 rounded" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-2 w-full rounded" />
            </div>
          ))}
          <div className="flex flex-col gap-3 border-t border-hairline pt-3.5">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex flex-grow flex-col gap-1.5">
                  <Skeleton className="h-3.5 w-40 rounded" />
                  <Skeleton className="h-3 w-56 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Latest calls */}
      <div className="card overflow-hidden">
        <div className="border-b border-hairline px-5 py-4">
          <Skeleton className="h-5 w-28 rounded" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-row px-5 py-3.5 last:border-b-0"
          >
            <div className="flex flex-grow flex-col gap-1.5">
              <Skeleton className="h-4 w-40 rounded" />
              <Skeleton className="h-3 w-28 rounded" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="hidden h-4 w-40 rounded sm:block" />
            <Skeleton className="h-4 w-16 rounded" />
          </div>
        ))}
      </div>
    </>
  );
}
