export interface SteamGame {
  steam_id: string;
  title: string;
  image: string;
  genres: string[];
  price_initial: number; // in cents
  price_final: number; // in cents
  discount_percent: number;
  is_free: boolean;
  cached_at?: string;
}

export interface ListItem {
  id: string;
  list_id: string;
  steam_id: string;
  position: number;
  game?: SteamGame;
}

export interface SteamList {
  id: string;
  creator_name: string;
  title: string;
  description?: string;
  created_at: string;
  expires_at: string;
  items: ListItem[];
}

export interface CreateListPayload {
  creator_name: string;
  title: string;
  description?: string;
  app_ids: string[];
}

export interface SteamAPIResponse {
  success: boolean;
  game?: SteamGame;
  error?: string;
}

export interface CreateListResponse {
  id: string;
  url: string;
}
