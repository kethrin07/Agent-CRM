import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-44 rounded-md" />
          <Skeleton className="h-4 w-80 rounded" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-11 w-40 rounded-lg" />
          <Skeleton className="h-11 w-32 rounded-lg" />
        </div>
      </div>

      {/* Agent tabs */}
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-[60px] w-[240px] rounded-xl" />
        ))}
      </div>

      {/* Two columns */}
      <div className="grid items-start gap-5 shell:[grid-template-columns:minmax(0,1.45fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card flex flex-col gap-4 p-5">
              <Skeleton className="h-5 w-40 rounded" />
              <Skeleton className="h-24 w-full rounded" />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card flex flex-col gap-4 p-5">
              <Skeleton className="h-5 w-40 rounded" />
              <Skeleton className="h-20 w-full rounded" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
