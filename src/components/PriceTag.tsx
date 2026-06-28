"use client";

import { SteamGame } from "@/types";
import { formatPrice } from "@/lib/steam";

interface PriceTagProps {
  game: SteamGame;
  compact?: boolean;
}

export default function PriceTag({ game, compact = false }: PriceTagProps) {
  const { price_initial, price_final, discount_percent, is_free } = game;

  if (is_free || price_final === 0) {
    return (
      <span
        className={`inline-flex items-center rounded-md bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30 ${
          compact ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
        }`}
      >
        Free to Play
      </span>
    );
  }

  if (discount_percent > 0) {
    return (
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center rounded-md bg-[#4c6b22] text-[#a4d007] font-bold ${
            compact ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-sm"
          }`}
        >
          -{discount_percent}%
        </span>
        <div className="flex flex-col items-end">
          <span
            className={`line-through text-steam-subtext ${
              compact ? "text-[10px]" : "text-xs"
            }`}
          >
            {formatPrice(price_initial, false)}
          </span>
          <span
            className={`text-[#a4d007] font-bold ${
              compact ? "text-sm" : "text-base"
            }`}
          >
            {formatPrice(price_final, false)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <span
      className={`font-semibold text-white ${
        compact ? "text-sm" : "text-base"
      }`}
    >
      {formatPrice(price_final, false)}
    </span>
  );
}
