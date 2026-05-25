/** Skeleton loader matching ProductCard dimensions */
export default function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="aspect-square bg-dark-200 dark:bg-dark-700" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton h-6 w-28 rounded" />
        <div className="skeleton h-8 w-full rounded-xl sm:hidden" />
      </div>
    </div>
  );
}
