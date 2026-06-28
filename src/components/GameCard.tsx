"use client";

import Image from "next/image";
import { SteamGame } from "@/types";
import PriceTag from "./PriceTag";

interface GameCardProps {
  game: SteamGame;
  onRemove?: (steamId: string) => void;
  showRemove?: boolean;
  index?: number;
}

export default function GameCard({
  game,
  onRemove,
  showRemove = false,
  index = 0,
}: GameCardProps) {
  const steamStoreUrl = `https://store.steampowered.com/app/${game.steam_id}`;
  const steamDeepLink = `steam://store/${game.steam_id}`;

  return (
    <div
      className="group relative overflow-hidden rounded-xl bg-[#1b2838] border border-white/5 
                 hover:border-[#4c9be8]/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(76,155,232,0.15)] 
                 hover:-translate-y-0.5"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Remove button (shown during list creation) */}
      {showRemove && onRemove && (
        <button
          onClick={() => onRemove(game.steam_id)}
          id={`remove-game-${game.steam_id}`}
          className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-black/70 
                     flex items-center justify-center opacity-0 group-hover:opacity-100 
                     transition-opacity hover:bg-red-500/80 text-white text-sm"
          aria-label="Remove game"
        >
          ✕
        </button>
      )}

      {/* Header image */}
      <div className="relative w-full aspect-[460/215] overflow-hidden">
        <Image
          src={game.image}
          alt={game.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1b2838] via-transparent to-transparent opacity-60" />

        {/* Discount badge overlay */}
        {game.discount_percent > 0 && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 rounded-md bg-[#4c6b22] text-[#a4d007] text-sm font-bold shadow-lg">
              -{game.discount_percent}%
            </span>
          </div>
        )}
      </div>

      {/* Card content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2 group-hover:text-[#66c0f4] transition-colors">
          {game.title}
        </h3>

        {/* Genres */}
        {game.genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {game.genres.slice(0, 3).map((genre) => (
              <span
                key={genre}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-[#8ba7c7] border border-white/5"
              >
                {genre}
              </span>
            ))}
          </div>
        )}

        {/* Price + Actions */}
        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          <PriceTag game={game} />
          <a
            href={steamDeepLink}
            onClick={(e) => {
              // Fallback to web store if Steam isn't installed
              setTimeout(() => {
                window.open(steamStoreUrl, "_blank", "noopener,noreferrer");
              }, 500);
            }}
            id={`open-steam-${game.steam_id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg 
                       bg-[#1a9fff]/10 hover:bg-[#1a9fff]/20 text-[#66c0f4] 
                       text-xs font-medium border border-[#1a9fff]/20 hover:border-[#1a9fff]/40
                       transition-all duration-200"
            aria-label={`Open ${game.title} in Steam`}
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" aria-hidden="true">
              <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.186.006l2.86-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z" />
            </svg>
            Open in Steam
          </a>
        </div>
      </div>
    </div>
  );
}
