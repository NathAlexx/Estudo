export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-white/5 bg-white/[0.03] p-5">
      <div className="mb-3 h-5 w-1/3 rounded bg-white/10"></div>
      <div className="mb-2 h-4 w-full rounded bg-white/5"></div>
      <div className="h-4 w-2/3 rounded bg-white/5"></div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-white/5 bg-white/[0.03] p-4"
        >
          <div className="h-4 w-3/4 rounded bg-white/10"></div>
        </div>
      ))}
    </div>
  );
}
