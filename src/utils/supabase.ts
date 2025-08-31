import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase env vars missing. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env");
}

const supabase = createClient(supabaseUrl!, supabaseKey!);
export default supabase;
