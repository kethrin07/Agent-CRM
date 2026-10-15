import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, requireEnv } from "@/lib/env";

/**
 * Server-side Supabase admin client (service-role key). Never import this from
 * the browser — it bypasses Row Level Security. Lazily created so the app
 * builds/runs with no Supabase env present.
 */

let client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client;
  const url = requireEnv("supabaseUrl");
  const serviceKey = requireEnv("supabaseServiceRoleKey");
  client = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

/** Table the post-call webhook writes leads into. */
export const LEADS_TABLE = "leads";

// Public anon config, safe to expose if a browser client is ever needed.
export const supabasePublicConfig = {
  url: env.supabaseUrl,
  anonKey: env.supabaseAnonKey,
};
