import { SteamGame } from "@/types";

const STEAM_API_BASE = "https://store.steampowered.com/api/appdetails";

/**
 * Extracts a Steam App ID from various Steam Store URL formats.
 * Supports:
 *   https://store.steampowered.com/app/1091500/Cyberpunk_2077/
 *   https://store.steampowered.com/app/1091500
 *   steam://store/1091500
 */
export function extractAppId(input: string): string | null {
  const trimmed = input.trim();

  // Match store.steampowered.com/app/{id}
  const webMatch = trimmed.match(
    /store\.steampowered\.com\/app\/(\d+)/i
  );
  if (webMatch) return webMatch[1];

  // Match steam://store/{id}
  const steamMatch = trimmed.match(/steam:\/\/store\/(\d+)/i);
  if (steamMatch) return steamMatch[1];

  // Match bare numeric ID
  if (/^\d+$/.test(trimmed)) return trimmed;

  return null;
}

/**
 * Fetches game metadata from the Steam Store API.
 * Must be called server-side (CORS restriction).
 */
export async function fetchSteamGame(appId: string): Promise<SteamGame | null> {
  try {
    const url = `${STEAM_API_BASE}?appids=${appId}&cc=us&l=en`;
    const res = await fetch(url, {
      next: { revalidate: 3600 }, // cache 1 hour in Next.js
    });

    if (!res.ok) return null;

    const data = await res.json();
    const appData = data[appId];

    if (!appData?.success || !appData?.data) return null;

    const d = appData.data;

    // Only support games (not DLC/soundtracks/etc)
    if (d.type !== "game") return null;

    const priceOverview = d.price_overview;
    const isFree = d.is_free ?? false;

    const genres: string[] = (d.genres ?? []).map(
      (g: { id: string; description: string }) => g.description
    );

    return {
      steam_id: String(appId),
      title: d.name ?? "Unknown Game",
      image: d.header_image ?? "",
      genres: genres.slice(0, 4),
      price_initial: priceOverview?.initial ?? 0,
      price_final: priceOverview?.final ?? 0,
      discount_percent: priceOverview?.discount_percent ?? 0,
      is_free: isFree,
    };
  } catch {
    return null;
  }
}

/**
 * Formats a price (in cents) to a display string.
 */
export function formatPrice(cents: number, isFree: boolean): string {
  if (isFree) return "Free";
  if (cents === 0) return "Free";
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Computes the total estimated price of a list of games (using final prices).
 */
export function computeTotalPrice(games: SteamGame[]): {
  total: number;
  hasFree: boolean;
} {
  let total = 0;
  let hasFree = false;

  for (const g of games) {
    if (g.is_free || g.price_final === 0) {
      hasFree = true;
    } else {
      total += g.price_final;
    }
  }

  return { total, hasFree };
}
