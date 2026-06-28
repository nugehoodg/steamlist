import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { fetchSteamGame } from "@/lib/steam";
import { checkRateLimit } from "@/lib/rateLimit";
import { containsProfanity } from "@/lib/profanity";
import { CreateListSchema } from "@/lib/validation";

// nanoid for short unique IDs
function generateId(length = 8): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  // Use crypto.getRandomValues for better randomness
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (const byte of array) {
    result += chars[byte % chars.length];
  }
  return result;
}

export async function POST(req: NextRequest) {
  // Rate limit: 10 list creations per hour per IP
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const allowed = checkRateLimit(`create_list:${ip}`, 10, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

  // Parse and validate body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = CreateListSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { creator_name, title, description, app_ids } = parsed.data;

  // Profanity check
  if (containsProfanity(creator_name) || containsProfanity(title)) {
    return NextResponse.json(
      { error: "Inappropriate content detected in name or title." },
      { status: 400 }
    );
  }

  // Deduplicate app_ids
  const uniqueAppIds = [...new Set(app_ids)];

  try {
    // Fetch metadata for all games (check cache first)
    const { data: cachedGames, error: fetchError } = await supabase
      .from("games")
      .select("*")
      .in("steam_id", uniqueAppIds);

    if (fetchError) throw fetchError;

    const cachedMap = new Map(
      (cachedGames ?? []).map((g) => [g.steam_id, g])
    );

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const gamesToFetch = uniqueAppIds.filter((id) => {
      const cached = cachedMap.get(id);
      return !cached || cached.cached_at < oneDayAgo;
    });

    // Fetch uncached/stale games from Steam
    const fetchResults = await Promise.allSettled(
      gamesToFetch.map((id) => fetchSteamGame(id))
    );

    const newGames: {
      steam_id: string;
      title: string;
      image: string;
      genres: string[];
      price_initial: number;
      price_final: number;
      discount_percent: number;
      is_free: boolean;
      cached_at: string;
    }[] = [];

    fetchResults.forEach((result, i) => {
      if (result.status === "fulfilled" && result.value) {
        const g = result.value;
        newGames.push({
          steam_id: g.steam_id,
          title: g.title,
          image: g.image,
          genres: g.genres,
          price_initial: g.price_initial,
          price_final: g.price_final,
          discount_percent: g.discount_percent,
          is_free: g.is_free,
          cached_at: new Date().toISOString(),
        });
        cachedMap.set(g.steam_id, { ...g, cached_at: new Date().toISOString() });
      } else {
        // Remove invalid/unfetchable IDs
        const failedId = gamesToFetch[i];
        const idx = uniqueAppIds.indexOf(failedId);
        if (idx !== -1) uniqueAppIds.splice(idx, 1);
      }
    });

    if (newGames.length > 0) {
      const { error: upsertError } = await supabase.from("games").upsert(newGames, { onConflict: "steam_id" });
      if (upsertError) throw upsertError;
    }

    // Ensure we still have at least one valid game
    const validAppIds = uniqueAppIds.filter((id) => cachedMap.has(id));
    if (validAppIds.length === 0) {
      return NextResponse.json(
        { error: "None of the provided Steam app IDs could be found." },
        { status: 400 }
      );
    }

    // Create the list
    const listId = generateId(8);
    const expiresAt = new Date(
      Date.now() + 90 * 24 * 60 * 60 * 1000
    ).toISOString();

    const { error: listError } = await supabase.from("lists").insert({
      id: listId,
      creator_name: creator_name.trim(),
      title: title.trim(),
      description: description?.trim() ?? null,
      expires_at: expiresAt,
    });

    if (listError) throw listError;

    // Insert list_items
    const listItems = validAppIds.map((steam_id, idx) => ({
      list_id: listId,
      steam_id,
      position: idx,
    }));

    const { error: itemsError } = await supabase
      .from("list_items")
      .insert(listItems);

    if (itemsError) {
      // Rollback list creation
      await supabase.from("lists").delete().eq("id", listId);
      throw itemsError;
    }

    return NextResponse.json({
      id: listId,
      url: `/list/${listId}`,
    });
  } catch (err: any) {
    console.error("Supabase Database Error:", err);
    return NextResponse.json(
      { error: `Database Error: ${err.message || err.description || err}` },
      { status: 500 }
    );
  }
}
