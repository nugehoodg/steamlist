import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SteamList } from "@/types";
import ListHeader from "@/components/ListHeader";
import ListActions from "@/components/ListActions";
import GameList from "@/components/GameList";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getList(id: string): Promise<SteamList | null> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  try {
    const res = await fetch(`${baseUrl}/api/lists/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
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
