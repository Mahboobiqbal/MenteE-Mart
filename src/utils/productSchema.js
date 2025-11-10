import supabase from "./supabase";

const schemaSupportCache = new Map();

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
    return supported;
  } catch (error) {
    console.error(`Failed to introspect products.${column}:`, error);
    schemaSupportCache.set(column, false);
    return false;
  }
};

export const rememberProductColumnSupport = (column, isSupported) => {
  if (!column) return;
  schemaSupportCache.set(column, Boolean(isSupported));
};
