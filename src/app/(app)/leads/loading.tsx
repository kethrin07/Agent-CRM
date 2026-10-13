import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-48 rounded-md" />
          <Skeleton className="h-4 w-80 rounded" />
        </div>
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-11 w-full max-w-[360px] rounded-lg" />
        <div className="flex gap-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-20 rounded-full" />
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="border-b border-hairline bg-hover px-5 py-3.5">
          <Skeleton className="h-4 w-full max-w-[520px] rounded" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-row px-5 py-3.5 last:border-b-0"
          >
            <div className="flex flex-grow flex-col gap-1.5">
              <Skeleton className="h-4 w-40 rounded" />
              <Skeleton className="h-3 w-28 rounded" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="hidden h-2 w-24 rounded sm:block" />
            <Skeleton className="hidden h-4 w-40 rounded md:block" />
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
        ))}
      </div>
    </>
  );
}
