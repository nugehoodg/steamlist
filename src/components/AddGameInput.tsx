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
  const [activeTab, setActiveTab] = useState<"single" | "batch">("single");
  const [inputValue, setInputValue] = useState("");
  const [batchValue, setBatchValue] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [batchSuccess, setBatchSuccess] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  async function handleBatchAddGames() {
    setBatchError(null);
    setBatchSuccess(null);
    const raw = batchValue.trim();
    if (!raw) {
      setBatchError("Paste one or more Steam Store URLs or App IDs.");
      return;
    }

    // Split by newlines, commas, semicolons, or multiple spaces
    const segments = raw.split(/[\n,;\s]+/).map((s) => s.trim()).filter(Boolean);
    const appIds: string[] = [];
    const invalidSegments: string[] = [];

    for (const segment of segments) {
      const appId = extractAppId(segment);
      if (appId) {
        appIds.push(appId);
      } else {
        invalidSegments.push(segment);
      }
    }

    const uniqueAppIds = [...new Set(appIds)];
    const newAppIds = uniqueAppIds.filter((id) => !games.some((g) => g.steam_id === id));
    const duplicatesCount = uniqueAppIds.length - newAppIds.length;

    if (newAppIds.length === 0) {
      if (duplicatesCount > 0) {
        setBatchError("All provided games are already in your list.");
      } else {
        setBatchError("No valid Steam App IDs found. Example: store.steampowered.com/app/730");
      }
      return;
    }

    if (games.length + newAppIds.length > MAX_GAMES) {
      setBatchError(`Adding these games would exceed the maximum limit of ${MAX_GAMES} games. Currently: ${games.length}/${MAX_GAMES}.`);
      return;
    }

    setLoading(true);
    let addedCount = 0;
    let failedCount = 0;

    try {
      // Fetch details in parallel
      const results = await Promise.allSettled(
        newAppIds.map(async (id) => {
          const res = await fetch(`/api/steam?appid=${id}`);
          if (!res.ok) throw new Error("Fetch failed");
          const data = await res.json();
          if (!data.success || !data.game) throw new Error(data.error || "Failed");
          return data.game;
        })
      );

      results.forEach((result) => {
        if (result.status === "fulfilled" && result.value) {
          onGameAdded(result.value);
          addedCount++;
        } else {
          failedCount++;
        }
      });

      let msg = `Added ${addedCount} game${addedCount !== 1 ? "s" : ""}.`;
      if (failedCount > 0) {
        msg += ` ${failedCount} failed to fetch.`;
      }
      if (duplicatesCount > 0) {
        msg += ` ${duplicatesCount} duplicate${duplicatesCount !== 1 ? "s" : ""} skipped.`;
      }
      if (invalidSegments.length > 0) {
        msg += ` Ignored ${invalidSegments.length} invalid inputs.`;
      }

      if (addedCount > 0) {
        setBatchSuccess(msg);
        setBatchValue("");
      } else {
        setBatchError(`Failed to fetch any games. Details: ${msg}`);
      }
    } catch {
      setBatchError("An unexpected network error occurred.");
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
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1.5 p-1 rounded-xl bg-[#0d1b2a]/60 border border-white/5 max-w-xs">
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            setActiveTab("single");
            setError(null);
          }}
          className={`flex-1 py-2 text-center rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === "single"
              ? "bg-[#1a9fff]/10 text-[#66c0f4] border border-[#1a9fff]/20"
              : "text-[#8ba7c7] hover:text-white border border-transparent"
          } disabled:opacity-50`}
        >
          Single Link
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            setActiveTab("batch");
            setBatchError(null);
            setBatchSuccess(null);
          }}
          className={`flex-1 py-2 text-center rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === "batch"
              ? "bg-[#1a9fff]/10 text-[#66c0f4] border border-[#1a9fff]/20"
              : "text-[#8ba7c7] hover:text-white border border-transparent"
          } disabled:opacity-50`}
        >
          Batch Paste
        </button>
      </div>

      <div>
        {activeTab === "single" ? (
          <div className="space-y-2">
            <label
              htmlFor="steam-url-input"
              className="block text-sm font-medium text-[#8ba7c7] mb-2"
            >
              Steam Store URL
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
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
                type="button"
                onClick={handleAddGame}
                disabled={disabled || loading || atLimit}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#1a9fff] hover:bg-[#2eaaff] 
                           text-white font-semibold text-sm transition-all duration-200 cursor-pointer
                           disabled:opacity-50 disabled:cursor-not-allowed
                           hover:shadow-[0_0_20px_rgba(26,159,255,0.4)] active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Fetching…
                  </>
                ) : (
                  "Add Game"
                )}
              </button>
            </div>

            {error && (
              <p className="mt-2 text-sm text-red-400 flex items-center gap-1.5">
                <span>⚠</span> {error}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <label
              htmlFor="steam-batch-textarea"
              className="block text-sm font-medium text-[#8ba7c7] mb-2"
            >
              Paste multiple URLs or App IDs
            </label>
            <div className="space-y-3">
              <textarea
                ref={textareaRef}
                id="steam-batch-textarea"
                rows={4}
                value={batchValue}
                onChange={(e) => {
                  setBatchValue(e.target.value);
                  setBatchError(null);
                  setBatchSuccess(null);
                }}
                disabled={disabled || loading || atLimit}
                placeholder={`Example:\nhttps://store.steampowered.com/app/1091500/Cyberpunk_2077/\nhttps://store.steampowered.com/app/1174180/Red_Dead_Redemption_2/\n413150`}
                className="w-full px-4 py-3 rounded-xl bg-[#0d1b2a] border border-white/10 
                           text-white placeholder-[#4a6580] text-sm resize-none
                           focus:outline-none focus:border-[#4c9be8]/60 focus:ring-1 focus:ring-[#4c9be8]/30
                           disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              />
              <div className="flex justify-end">
                <button
                  id="add-games-batch-button"
                  type="button"
                  onClick={handleBatchAddGames}
                  disabled={disabled || loading || atLimit}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#1a9fff] hover:bg-[#2eaaff] 
                             text-white font-semibold text-sm transition-all duration-200 cursor-pointer
                             disabled:opacity-50 disabled:cursor-not-allowed
                             hover:shadow-[0_0_20px_rgba(26,159,255,0.4)] active:scale-95 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Fetching batch…
                    </>
                  ) : (
                    "Add Games"
                  )}
                </button>
              </div>
            </div>

            {batchError && (
              <p className="mt-2 text-sm text-red-400 flex items-center gap-1.5">
                <span>⚠</span> {batchError}
              </p>
            )}

            {batchSuccess && (
              <p className="mt-2 text-sm text-emerald-400 flex items-center gap-1.5">
                <span>✔</span> {batchSuccess}
              </p>
            )}
          </div>
        )}

        {/* Limit indicator */}
        <p className="mt-2 text-xs text-[#4a6580]">
          {games.length}/{MAX_GAMES} games · {activeTab === "single" ? "Press Enter to add" : "Paste space/newline/comma separated"}
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
