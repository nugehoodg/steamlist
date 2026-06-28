-- ============================================================
-- SteamShelf Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable pgcrypto for gen_random_uuid()
create extension if not exists pgcrypto;

-- ============================================================
-- TABLES
-- ============================================================

create table if not exists lists (
  id            text primary key,                          -- nanoid (8 chars)
  creator_name  text not null check (char_length(creator_name) between 2 and 30),
  title         text not null check (char_length(title) between 3 and 80),
  description   text check (char_length(description) <= 500),
  created_at    timestamptz not null default now(),
  expires_at    timestamptz not null default (now() + interval '90 days')
);

create table if not exists games (
  steam_id          text primary key,
  title             text not null,
  image             text not null default '',
  genres            text[] not null default '{}',
  price_initial     integer not null default 0,   -- cents USD
  price_final       integer not null default 0,   -- cents USD
  discount_percent  integer not null default 0,
  is_free           boolean not null default false,
  cached_at         timestamptz not null default now()
);

create table if not exists list_items (
  id        uuid primary key default gen_random_uuid(),
  list_id   text not null references lists(id) on delete cascade,
  steam_id  text not null references games(steam_id),
  position  integer not null default 0,
  unique (list_id, steam_id)
);

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists idx_list_items_list_id on list_items(list_id);
create index if not exists idx_list_items_position on list_items(list_id, position);
create index if not exists idx_lists_expires_at on lists(expires_at);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Allow public reads, allow inserts via anon key (no auth needed)
-- ============================================================

alter table lists enable row level security;
alter table games enable row level security;
alter table list_items enable row level security;

-- Anyone can read lists (not expired)
create policy "Public read lists"
  on lists for select
  using (expires_at > now());

-- Anyone can insert a list (anon key)
create policy "Public insert lists"
  on lists for insert
  with check (true);

-- Anyone can read games
create policy "Public read games"
  on games for select
  using (true);

-- Anyone can upsert games (server-side caching)
create policy "Public upsert games"
  on games for insert
  with check (true);

create policy "Public update games"
  on games for update
  using (true);

-- Anyone can read list_items
create policy "Public read list_items"
  on list_items for select
  using (true);

-- Anyone can insert list_items
create policy "Public insert list_items"
  on list_items for insert
  with check (true);

-- ============================================================
-- CLEANUP FUNCTION: Purge expired lists
-- Optionally schedule with pg_cron or a Supabase Edge Function
-- ============================================================

create or replace function purge_expired_lists()
returns void
language plpgsql
as $$
begin
  delete from lists where expires_at < now();
end;
$$;
