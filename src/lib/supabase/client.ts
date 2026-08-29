import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null | undefined;

export interface SupabasePublicConfig {
  url?: string | undefined;
  publishableKey?: string | undefined;
}

export function getSupabaseBrowserClient(config: SupabasePublicConfig = {}) {
  if (browserClient !== undefined) return browserClient;

  const url = config.url ?? import.meta.env["VITE_SUPABASE_URL"];
  const publishableKey =
    config.publishableKey ?? import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !publishableKey) {
    browserClient = null;
    return browserClient;
  }

  browserClient = createClient(url, publishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return browserClient;
}
