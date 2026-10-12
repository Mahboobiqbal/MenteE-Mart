import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase env vars missing. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env");
}

// Fall back to placeholder values so the app can still boot (and surface
// network errors gracefully) when the environment is not configured yet.
const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseKey || "public-anon-key-placeholder"
);
export default supabase;
