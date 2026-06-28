"use client";

import { useState, useRef } from "react";
import { SteamGame } from "@/types";
import { extractAppId } from "@/lib/steam";
import GameCardSkeleton from "./GameCardSkeleton";
import GameCard from "./GameCard";

interface AddGameInputProps {
  games: SteamGame[];
  onGameAdded: (game: SteamGame) => void;
  onGameRemoved: (steamId: string) => void;
  disabled?: boolean;
}

export default function AddGameInput({
  games,
  onGameAdded,
  onGameRemoved,
  disabled = false,
}: AddGameInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const MAX_GAMES = 50;
  const atLimit = games.length >= MAX_GAMES;

  async function handleAddGame() {
    setError(null);
    const raw = inputValue.trim();
    if (!raw) {
      setError("Paste a Steam Store URL or App ID.");
      return;
    }

    const appId = extractAppId(raw);
    if (!appId) {
      setError("Couldn't find a Steam App ID in that URL. Example: store.steampowered.com/app/730");
      return;
    }

    // Duplicate check
    if (games.some((g) => g.steam_id === appId)) {
      setError("This game is already in your list.");
      setInputValue("");
      return;
    }

    if (atLimit) {
      setError("Maximum 50 games per list.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/steam?appid=${appId}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error ?? "Game not found. Check the URL and try again.");
      } else {
        onGameAdded(data.game);
        setInputValue("");
        inputRef.current?.focus();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddGame();
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="steam-url-input"
          className="block text-sm font-medium text-[#8ba7c7] mb-2"
        >
          Steam Store URL
        </label>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            id="steam-url-input"
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            disabled={disabled || loading || atLimit}
            placeholder="https://store.steampowered.com/app/1091500/Cyberpunk_2077/"
            className="flex-1 px-4 py-3 rounded-xl bg-[#0d1b2a] border border-white/10 
                       text-white placeholder-[#4a6580] text-sm 
                       focus:outline-none focus:border-[#4c9be8]/60 focus:ring-1 focus:ring-[#4c9be8]/30
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          />
          <button
            id="add-game-button"
            onClick={handleAddGame}
            disabled={disabled || loading || atLimit}
            className="px-5 py-3 rounded-xl bg-[#1a9fff] hover:bg-[#2eaaff] 
                       text-white font-semibold text-sm transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed
                       hover:shadow-[0_0_20px_rgba(26,159,255,0.4)] active:scale-95"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Fetching…
              </span>
            ) : (
              "Add Game"
            )}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <p className="mt-2 text-sm text-red-400 flex items-center gap-1.5">
            <span>⚠</span> {error}
          </p>
        )}

        {/* Limit indicator */}
        <p className="mt-1.5 text-xs text-[#4a6580]">
          {games.length}/{MAX_GAMES} games · Press Enter to add
        </p>
      </div>

      {/* Game cards grid */}
      {(games.length > 0 || loading) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game, idx) => (
            <GameCard
              key={game.steam_id}
              game={game}
              index={idx}
              showRemove
              onRemove={onGameRemoved}
            />
          ))}
          {loading && <GameCardSkeleton />}
        </div>
      )}
    </div>
  );
}
