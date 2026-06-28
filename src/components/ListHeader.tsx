import { SteamList } from "@/types";
import { formatPrice, computeTotalPrice } from "@/lib/steam";

interface ListHeaderProps {
  list: SteamList;
}

export default function ListHeader({ list }: ListHeaderProps) {
  const games = list.items.map((item) => item.game!).filter(Boolean);
  const { total, hasFree } = computeTotalPrice(games);
  const createdAt = new Date(list.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-4">
      {/* Creator */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1a9fff] to-[#7c3aed] flex items-center justify-center">
          <span className="text-white text-xs font-bold">
            {list.creator_name[0].toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-xs text-[#8ba7c7]">Created by</p>
          <p className="text-sm font-semibold text-white">
            {list.creator_name}
          </p>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
        {list.title}
      </h1>

      {/* Description */}
      {list.description && (
        <p className="text-[#8ba7c7] text-base leading-relaxed max-w-2xl">
          {list.description}
        </p>
      )}

      {/* Stats bar */}
      <div className="flex flex-wrap gap-4 pt-2">
        {/* Game count */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4 text-[#66c0f4]"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5S14.67 12 15.5 12s1.5.67 1.5 1.5S16.33 15 15.5 15zm3-3c-.83 0-1.5-.67-1.5-1.5S17.67 10 18.5 10s1.5.67 1.5 1.5S19.33 12 18.5 12z" />
          </svg>
          <span className="text-sm text-white font-medium">
            {games.length} {games.length === 1 ? "game" : "games"}
          </span>
        </div>

        {/* Total price */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4 text-[#a4d007]"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
          </svg>
          <span className="text-sm text-white font-medium">
            Est. {formatPrice(total, false)}
            {hasFree && (
              <span className="ml-1 text-[#8ba7c7] text-xs">
                (+ free games)
              </span>
            )}
          </span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4 text-[#8ba7c7]"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
          </svg>
          <span className="text-sm text-[#8ba7c7]">{createdAt}</span>
        </div>
      </div>
    </div>
  );
}
