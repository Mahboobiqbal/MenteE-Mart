import supabase from "./supabase";

const CACHE_KEY = "product_schema_support_v1";

const loadPersistedCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return new Map(Object.entries(parsed));
    }
  } catch {
    // ignore corrupt cache
  }
  return new Map();
};

const schemaSupportCache = loadPersistedCache();

const persistCache = () => {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify(Object.fromEntries(schemaSupportCache))
    );
  } catch {
    // storage unavailable — in-memory cache still works
  }
};

const COLUMN_ERROR_PATTERN =
  /column.*(does not exist|of 'products' in the schema cache)/i;

export const productSupportsColumn = async (column) => {
  if (!column) return false;
  if (schemaSupportCache.has(column)) {
    return schemaSupportCache.get(column);
  }

  try {
    const { error } = await supabase.from("products").select(column).limit(1);

    const supported = !error || !COLUMN_ERROR_PATTERN.test(error.message || "");
    schemaSupportCache.set(column, supported);
    persistCache();
    return supported;
  } catch (error) {
    console.error(`Failed to introspect products.${column}:`, error);
    schemaSupportCache.set(column, false);
    persistCache();
    return false;
  }
};

export const rememberProductColumnSupport = (column, isSupported) => {
  if (!column) return;
  schemaSupportCache.set(column, Boolean(isSupported));
  persistCache();
};
