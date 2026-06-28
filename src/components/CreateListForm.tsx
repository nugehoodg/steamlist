"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SteamGame } from "@/types";
import AddGameInput from "./AddGameInput";

export default function CreateListForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [creatorName, setCreatorName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [games, setGames] = useState<SteamGame[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Handle clone: pre-fill games from query params
  const handleCloneLoad = useCallback(async (appIds: string[]) => {
    const cloneId = searchParams.get("clone");
    if (cloneId) {
      try {
        const res = await fetch(`/api/lists/${cloneId}`);
        if (res.ok) {
          const data = await res.json();
          setTitle(`${data.title} (Clone)`);
          setDescription(data.description ?? "");
        }
      } catch {
        // Ignore errors; just pre-fill games
      }
    }

    // Fetch each game
    const fetched: SteamGame[] = [];
    for (const id of appIds.slice(0, 50)) {
      try {
        const res = await fetch(`/api/steam?appid=${id}`);
        const data = await res.json();
        if (data.success && data.game) {
          fetched.push(data.game);
        }
      } catch {
        // Skip unfetchable games
      }
    }
    setGames(fetched);
  }, [searchParams]);

  useEffect(() => {
    const appIds = searchParams.get("app_ids");
    if (appIds) {
      handleCloneLoad(appIds.split(",").filter(Boolean));
    }
  }, [searchParams, handleCloneLoad]);

  function addGame(game: SteamGame) {
    setGames((prev) => [...prev, game]);
  }

  function removeGame(steamId: string) {
    setGames((prev) => prev.filter((g) => g.steam_id !== steamId));
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!creatorName.trim() || creatorName.trim().length < 2) {
      errors.creatorName = "Creator name must be at least 2 characters.";
    }
    if (creatorName.trim().length > 30) {
      errors.creatorName = "Creator name must be at most 30 characters.";
    }
    if (!title.trim() || title.trim().length < 3) {
      errors.title = "Title must be at least 3 characters.";
    }
    if (title.trim().length > 80) {
      errors.title = "Title must be at most 80 characters.";
    }
    if (description.trim().length > 500) {
      errors.description = "Description must be at most 500 characters.";
    }
    if (games.length === 0) {
      errors.games = "Add at least one game before generating a link.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creator_name: creatorName.trim(),
          title: title.trim(),
          description: description.trim() || undefined,
          app_ids: games.map((g) => g.steam_id),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        router.push(`/list/${data.id}`);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-3 rounded-xl bg-[#0d1b2a] border text-white text-sm placeholder-[#4a6580]
     focus:outline-none focus:ring-1 transition-colors
     ${
       hasError
         ? "border-red-500/60 focus:border-red-500/80 focus:ring-red-500/20"
         : "border-white/10 focus:border-[#4c9be8]/60 focus:ring-[#4c9be8]/30"
     }`;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Creator Name */}
      <div>
        <label htmlFor="creator-name" className="block text-sm font-medium text-[#8ba7c7] mb-2">
          Creator Name <span className="text-red-400">*</span>
        </label>
        <input
          id="creator-name"
          type="text"
          value={creatorName}
          onChange={(e) => {
            setCreatorName(e.target.value);
            setFieldErrors((p) => ({ ...p, creatorName: "" }));
          }}
          maxLength={30}
          placeholder="Created by…"
          className={inputClass(!!fieldErrors.creatorName)}
        />
        <div className="flex justify-between mt-1">
          {fieldErrors.creatorName ? (
            <p className="text-xs text-red-400">{fieldErrors.creatorName}</p>
          ) : (
            <span />
          )}
          <p className="text-xs text-[#4a6580] text-right">
            {creatorName.length}/30
          </p>
        </div>
      </div>

      {/* List Title */}
      <div>
        <label htmlFor="list-title" className="block text-sm font-medium text-[#8ba7c7] mb-2">
          List Title <span className="text-red-400">*</span>
        </label>
        <input
          id="list-title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setFieldErrors((p) => ({ ...p, title: "" }));
          }}
          maxLength={80}
          placeholder="Summer Sale Roguelikes"
          className={inputClass(!!fieldErrors.title)}
        />
        <div className="flex justify-between mt-1">
          {fieldErrors.title ? (
            <p className="text-xs text-red-400">{fieldErrors.title}</p>
          ) : (
            <span />
          )}
          <p className="text-xs text-[#4a6580] text-right">
            {title.length}/80
          </p>
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="list-description" className="block text-sm font-medium text-[#8ba7c7] mb-2">
          Description <span className="text-[#4a6580] font-normal">(optional)</span>
        </label>
        <textarea
          id="list-description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setFieldErrors((p) => ({ ...p, description: "" }));
          }}
          maxLength={500}
          rows={3}
          placeholder="Fast-paced runs, replayable, and great discounts…"
          className={`${inputClass(!!fieldErrors.description)} resize-none`}
        />
        <div className="flex justify-between mt-1">
          {fieldErrors.description ? (
            <p className="text-xs text-red-400">{fieldErrors.description}</p>
          ) : (
            <span />
          )}
          <p className="text-xs text-[#4a6580] text-right">
            {description.length}/500
          </p>
        </div>
      </div>

      {/* Game Input */}
      <div>
        <div className="h-px bg-white/5 mb-6" />
        {fieldErrors.games && (
          <p className="mb-3 text-sm text-red-400 flex items-center gap-1.5">
            <span>⚠</span> {fieldErrors.games}
          </p>
        )}
        <AddGameInput
          games={games}
          onGameAdded={addGame}
          onGameRemoved={removeGame}
          disabled={submitting}
        />
      </div>

      {/* Global error */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Submit */}
      <div className="h-px bg-white/5" />
      <button
        id="generate-share-link-button"
        type="submit"
        disabled={submitting}
        className="w-full py-4 rounded-xl font-bold text-white text-base
                   bg-gradient-to-r from-[#1a9fff] to-[#7c3aed]
                   hover:from-[#2eaaff] hover:to-[#8b5cf6]
                   shadow-[0_0_30px_rgba(26,159,255,0.25)]
                   hover:shadow-[0_0_40px_rgba(26,159,255,0.4)]
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-300 active:scale-[0.98]"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Creating your list…
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
              <path d="M17 7h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1 0 1.71-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5zm-6 8H7c-1.71 0-3.1-1.39-3.1-3.1 0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-2zm-3-4h8v-2H8v2z" />
            </svg>
            Generate Share Link
          </span>
        )}
      </button>
    </form>
  );
}
