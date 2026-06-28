import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SteamList } from "@/types";
import ListHeader from "@/components/ListHeader";
import ListActions from "@/components/ListActions";
import GameList from "@/components/GameList";
import { supabase } from "@/lib/supabase";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getList(id: string): Promise<SteamList | null> {
  if (!id || !/^[A-Za-z0-9]{8}$/.test(id)) {
    return null;
  }

  try {
    // Fetch list directly from Supabase
    const { data: list, error: listError } = await supabase
      .from("lists")
      .select("*")
      .eq("id", id)
      .single();

    if (listError || !list) return null;

    // Check expiry
    if (new Date(list.expires_at) < new Date()) {
      return null;
    }

    // Fetch list_items joined with games directly
    const { data: items, error: itemsError } = await supabase
      .from("list_items")
      .select(`
        id,
        position,
        steam_id,
        games (
          steam_id,
          title,
          image,
          genres,
          price_initial,
          price_final,
          discount_percent,
          is_free
        )
      `)
      .eq("list_id", id)
      .order("position", { ascending: true });

    if (itemsError) {
      console.error("Items fetch error server-side:", itemsError);
      return null;
    }

    return {
      ...list,
      items: (items ?? []).map((item: any) => ({
        id: item.id,
        position: item.position,
        steam_id: item.steam_id,
        game: item.games,
      })),
    };
  } catch (err) {
    console.error("Error in getList server-side:", err);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const list = await getList(id);

  if (!list) {
    return {
      title: "List Not Found · SteamShelf",
    };
  }

  const gameCount = list.items?.length ?? 0;

  return {
    title: `${list.title} · SteamShelf`,
    description: list.description
      ? `${list.description} — ${gameCount} games by ${list.creator_name}`
      : `A curated list of ${gameCount} Steam game${gameCount !== 1 ? "s" : ""} by ${list.creator_name}`,
    openGraph: {
      title: list.title,
      description: `By ${list.creator_name} · ${gameCount} games`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: list.title,
      description: `By ${list.creator_name} · ${gameCount} games on SteamShelf`,
    },
  };
}

export default async function ListPage({ params }: PageProps) {
  const { id } = await params;
  const list = await getList(id);

  if (!list) {
    notFound();
  }

  const games = list.items
    .sort((a, b) => a.position - b.position)
    .map((item) => item.game!)
    .filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      {/* Header section */}
      <div className="space-y-6">
        <ListHeader list={list} />

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Actions */}
        <ListActions list={list} />
      </div>

      {/* Games grid */}
      <section aria-label="Games in this list">
        <GameList games={games} />
      </section>
    </div>
  );
}
