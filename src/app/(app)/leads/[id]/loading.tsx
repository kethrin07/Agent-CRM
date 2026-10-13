import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <>
      <Skeleton className="h-4 w-20 rounded" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-48 rounded-md" />
            <Skeleton className="h-4 w-80 rounded" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-11 w-28 rounded-lg" />
          <Skeleton className="h-11 w-24 rounded-lg" />
          <Skeleton className="h-11 w-24 rounded-lg" />
        </div>
      </div>

      {/* Two-column grid */}
      <div className="grid items-start gap-5 [grid-template-columns:repeat(auto-fit,minmax(360px,1fr))]">
        <div className="flex flex-col gap-5">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="card flex flex-col gap-3.5 p-5">
              <Skeleton className="h-5 w-32 rounded" />
              <Skeleton className="h-16 w-full rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-4/5 rounded" />
            </div>
          ))}
        </div>
        <div className="card flex flex-col gap-4 p-5">
          <Skeleton className="h-5 w-44 rounded" />
          <Skeleton className="h-11 w-full rounded-lg" />
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-4 w-10 rounded" />
              <Skeleton className="h-4 flex-grow rounded" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
