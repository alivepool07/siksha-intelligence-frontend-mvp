import { Skeleton } from "@/components/ui/skeleton";

export function HeaderSkeleton() {
  return (
    <div className="flex items-center gap-4 bg-card p-6 rounded-xl border border-border/50 shadow-sm col-span-1 md:col-span-2 lg:col-span-3">
      <Skeleton className="h-16 w-16 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}

export function AcademicSkeleton() {
  return (
    <div className="bg-card p-6 rounded-xl border border-border/50 shadow-sm flex flex-col gap-4">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-20 w-full rounded-lg" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}

export function AttendanceSkeleton() {
  return (
    <div className="bg-card p-6 rounded-xl border border-border/50 shadow-sm flex flex-col items-center justify-center gap-4 h-[240px]">
      <Skeleton className="h-32 w-32 rounded-full" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}

export function FinanceSkeleton() {
  return (
    <div className="bg-card p-6 rounded-xl border border-border/50 shadow-sm flex flex-col gap-4">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-12 w-32" />
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  );
}

export function TimelineSkeleton() {
  return (
    <div className="bg-card p-6 rounded-xl border border-border/50 shadow-sm col-span-1 md:col-span-2 lg:col-span-1 space-y-6">
      <Skeleton className="h-6 w-32" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="space-y-2 w-full">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardBentoSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <HeaderSkeleton />
      <AcademicSkeleton />
      <AttendanceSkeleton />
      <FinanceSkeleton />
      <TimelineSkeleton />
    </div>
  );
}
