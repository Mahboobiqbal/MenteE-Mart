const { createClient } = require("@supabase/supabase-js");

async function inspectTable(table) {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error("Missing Supabase env vars");
    process.exit(1);
  }

  const supabase = createClient(url, key);
  const { data, error } = await supabase.from(table).select("*").limit(5);
  if (error) {
    console.error(`Error fetching from ${table}:`, error);
    process.exit(1);
  }
  console.log(`Table: ${table}`);
  console.log(JSON.stringify(data, null, 2));
}

const table = process.argv[2];
if (!table) {
  console.error("Usage: node scripts/inspectTable.cjs <table>");
  process.exit(1);
}

inspectTable(table);
