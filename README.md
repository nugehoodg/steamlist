# SteamShelf 🎮

A Pastebin-style website for sharing curated Steam game lists. No accounts required.

## Features

- Paste Steam Store URLs → automatically fetch game metadata
- Steam-style game cards with title, image, genres, and pricing
- Discount badges and price calculations
- Copy shareable link with one click
- Clone & edit any existing list
- Open games directly in Steam client
- Anonymous — no login needed
- Lists expire after 90 days

---

## Setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project.
2. Navigate to **Settings → API** and copy:
   - `Project URL`
   - `anon` public key

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Run the database schema

1. Open your Supabase project → **SQL Editor**
2. Copy the contents of [`supabase/schema.sql`](./supabase/schema.sql)
3. Paste and click **Run**

### 4. Install dependencies and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout (nav, footer)
│   ├── page.tsx                # Homepage — create list form
│   ├── globals.css             # Global styles
│   ├── list/[id]/page.tsx      # Shared list view
│   └── api/
│       ├── steam/route.ts      # GET /api/steam?appid=xxx
│       └── lists/
│           ├── route.ts        # POST /api/lists
│           └── [id]/route.ts   # GET /api/lists/[id]
├── components/
│   ├── CreateListForm.tsx      # Main creation form
│   ├── AddGameInput.tsx        # URL input + game fetcher
│   ├── GameCard.tsx            # Steam-style card
│   ├── GameCardSkeleton.tsx    # Loading skeleton
│   ├── GameList.tsx            # Cards grid
│   ├── ListHeader.tsx          # Creator + stats
│   ├── ListActions.tsx         # Copy link + clone
│   └── PriceTag.tsx            # Price/discount display
├── lib/
│   ├── supabase.ts             # Supabase client
│   ├── steam.ts                # URL parsing + Steam API
│   ├── validation.ts           # Zod schemas
│   ├── rateLimit.ts            # In-memory rate limiter
│   └── profanity.ts            # Basic word filter
└── types/index.ts              # TypeScript interfaces

supabase/
└── schema.sql                  # Database schema + RLS policies
```

---

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Validation**: Zod
- **Image optimization**: next/image

---

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import in [vercel.com](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_BASE_URL` → your Vercel domain (e.g. `https://steamshelf.vercel.app`)

---

## Anti-abuse

- Rate limited: 10 list creations / hour per IP, 30 Steam lookups / hour per IP
- Server-side Zod validation on all inputs
- Steam URL regex validation (rejects non-Steam URLs)
- Duplicate game detection per list
- Max 50 games per list
- Basic profanity filter on creator name and title
- Lists auto-expire after 90 days

---

## Disclaimer

SteamShelf is not affiliated with Valve Corporation or Steam.
Game data is fetched from the Steam Store API and cached in Supabase.
