export function SkeletonCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] p-5">
      <div className="shimmer-bg absolute inset-0"></div>
      <div className="relative z-10">
        <div className="mb-3 h-5 w-1/3 rounded bg-white/[0.08]"></div>
        <div className="mb-2 h-4 w-full rounded bg-white/[0.05]"></div>
        <div className="h-4 w-2/3 rounded bg-white/[0.05]"></div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.03] p-4"
        >
          <div className="shimmer-bg absolute inset-0"></div>
          <div className="relative z-10 h-4 w-3/4 rounded bg-white/[0.08]"></div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] p-5"
        >
          <div className="shimmer-bg absolute inset-0"></div>
          <div className="relative z-10">
            <div className="mb-3 h-8 w-8 rounded-lg bg-white/[0.08]"></div>
            <div className="mb-2 h-5 w-2/3 rounded bg-white/[0.08]"></div>
            <div className="h-4 w-full rounded bg-white/[0.05]"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
