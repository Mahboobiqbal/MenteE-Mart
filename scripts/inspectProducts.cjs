const { createClient } = require("@supabase/supabase-js");

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

(async () => {
  const supabase = createClient(url, key);
  const { data, error } = await supabase.from("products").select("*").limit(1);
  if (error) {
    console.error("Error fetching products:", error);
    process.exit(1);
  }
  console.log(JSON.stringify(data, null, 2));
})();
