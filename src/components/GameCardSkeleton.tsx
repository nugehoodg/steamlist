export default function GameCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-[#1b2838] border border-white/5 animate-pulse">
      {/* Image placeholder */}
      <div className="w-full aspect-[460/215] bg-[#2a3f5f]" />
      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="h-4 bg-[#2a3f5f] rounded w-3/4" />
        <div className="flex gap-2">
          <div className="h-5 bg-[#2a3f5f] rounded-full w-16" />
          <div className="h-5 bg-[#2a3f5f] rounded-full w-20" />
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="h-6 bg-[#2a3f5f] rounded w-20" />
          <div className="h-8 bg-[#2a3f5f] rounded w-28" />
        </div>
      </div>
    </div>
  );
}
