import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    "[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set. " +
    "The site will fall back to local-only (per-browser) storage until these are configured."
  );
}

/** Shared Supabase client. `null` when env vars are missing, so callers can fall back gracefully. */
export const supabase = url && anonKey ? createClient(url, anonKey) : null;

export const SITE_DATA_ROW_ID = 1;
