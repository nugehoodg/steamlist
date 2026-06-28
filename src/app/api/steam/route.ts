import { NextRequest, NextResponse } from "next/server";
import { fetchSteamGame } from "@/lib/steam";
import { checkRateLimit } from "@/lib/rateLimit";
import { SteamAppIdSchema } from "@/lib/validation";

export async function GET(req: NextRequest) {
  // Rate limit: 30 requests per hour per IP
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const allowed = checkRateLimit(`steam:${ip}`, 30, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

  const appId = req.nextUrl.searchParams.get("appid");
  const parsed = SteamAppIdSchema.safeParse(appId);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid Steam App ID." },
      { status: 400 }
    );
  }

  const game = await fetchSteamGame(parsed.data);

  if (!game) {
    return NextResponse.json(
      { success: false, error: "Game not found or unsupported type." },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, game });
}
