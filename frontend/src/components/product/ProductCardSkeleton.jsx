export default function ProductCardSkeleton() {
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ backgroundColor: '#131921', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Image */}
      <div className="skeleton aspect-square w-full" />

      {/* Info */}
      <div className="p-3 space-y-2">
        <div className="skeleton h-3 w-2/3 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-4/5 rounded" />
        <div className="skeleton h-4 w-1/2 rounded mt-1" />
        <div className="skeleton h-7 w-full rounded mt-2" />
      </div>
    </div>
  );
}
