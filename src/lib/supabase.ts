import { createClient } from "@supabase/supabase-js";

let supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
let supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables."
  );
}

// Clean up trailing slash
if (supabaseUrl.endsWith("/")) {
  supabaseUrl = supabaseUrl.slice(0, -1);
}

// Clean up /rest/v1 if included in the env variable
if (supabaseUrl.endsWith("/rest/v1")) {
  supabaseUrl = supabaseUrl.slice(0, -8);
}

/**
 * Supabase client — safe to use in both server and browser contexts.
 * For server-only operations with elevated privileges, use the service role key instead.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
