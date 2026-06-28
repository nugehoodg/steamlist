import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || !/^[A-Za-z0-9]{8}$/.test(id)) {
    return NextResponse.json({ error: "Invalid list ID." }, { status: 400 });
  }

  // Fetch list
  const { data: list, error: listError } = await supabase
    .from("lists")
    .select("*")
    .eq("id", id)
    .single();

  if (listError || !list) {
    return NextResponse.json({ error: "List not found." }, { status: 404 });
  }

  // Check expiry
  if (new Date(list.expires_at) < new Date()) {
    return NextResponse.json(
      { error: "This list has expired.", expired: true },
      { status: 410 }
    );
  }

  // Fetch list_items joined with games
  const { data: items, error: itemsError } = await supabase
    .from("list_items")
    .select(
      `
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
    `
    )
    .eq("list_id", id)
    .order("position", { ascending: true });

  if (itemsError) {
    console.error("Items fetch error:", itemsError);
    return NextResponse.json(
      { error: "Failed to load games." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ...list,
    items: (items ?? []).map((item) => ({
      id: item.id,
      position: item.position,
      steam_id: item.steam_id,
      game: item.games,
    })),
  });
}
